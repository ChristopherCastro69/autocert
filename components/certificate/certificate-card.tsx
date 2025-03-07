import React, { useState, useEffect, useCallback, useMemo } from "react";
import Toolbar from "../toolbar";
import GoogleCert from "./../../app/public/images/gdg-cert.png";
import DefaultCert from "./../../app/public/images/Default.png";

import { Button } from "../ui/button";
import { XIcon } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import "@fontsource/poppins";
import "@fontsource/roboto";
import "@fontsource/pacifico";

import { createClient } from "@supabase/supabase-js";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";

interface CertificateCardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TextProperties {
  name: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  textColor: string;
  selectedFont: string;
  posX: number;
  posY: number;
}

export function CertificateCard({ isOpen, onClose }: CertificateCardProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>();
  const [imageList, setImageList] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [nameList, setNameList] = useState<{ combined: string }[]>([]);
  const [textProps, setTextProps] = useState<TextProperties>({
    name: "John Nommensen Duchac",
    fontSize: 100,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    textColor: "#000000",
    selectedFont: "Arial",
    posX: 500,
    posY: 300,
  });
  const [isImageFinal, setIsImageFinal] = useState<boolean>(false);
  const [imageListModal, setImageListModal] = useState<boolean>(false);
  const [isCapitalized, setIsCapitalized] = useState<boolean>(false);
  const [batchNumber, setBatchNumber] = useState<number>(1);
  const [isImageUploaded, setIsImageUploaded] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");
  const [isFolderNameDialogOpen, setIsFolderNameDialogOpen] =
    useState<boolean>(false);
  const [fetchedCertificates, setFetchedCertificates] = useState<string[]>([]);
  const [isViewCertificatesDialogOpen, setIsViewCertificatesDialogOpen] =
    useState<boolean>(false);

  // Initialize the Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Memoize the font style to avoid recalculating on every render
  const fontStyle = useMemo(() => {
    return `${textProps.isBold ? "bold" : ""} ${textProps.isItalic ? "italic" : ""} ${textProps.fontSize}px '${textProps.selectedFont}', sans-serif`;
  }, [
    textProps.isBold,
    textProps.isItalic,
    textProps.fontSize,
    textProps.selectedFont,
  ]);

  const handleImageUpload = useCallback((file: File) => {
    setSelectedImage(file);
  }, []);

  const handleGenerate = () => {
    const count = nameList.length;

    if (count === 0) {
      return;
    }

    setIsDownloading(true);

    const generateAndDownload = (index: number) => {
      if (index >= count) {
        setImageListModal(true);
        return;
      }

      setTextProps((prev) => ({ ...prev, name: nameList[index].combined }));
      console.log(
        `Name ${index}: "${nameList[index].combined}" where Count = ${index}`
      );

      generateCertificate();
      setTimeout(() => {
        generateAndDownload(index + 1);
      }, 2000);
    };

    generateAndDownload(0);
  };

  const generateCertificate = useCallback(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (selectedImage) {
      const image = new Image();
      image.src = URL.createObjectURL(selectedImage);

      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;

        if (context) {
          context.drawImage(image, 0, 0);

          // Capitalize the name if isCapitalized is true
          const displayName = isCapitalized
            ? textProps.name.toUpperCase()
            : textProps.name;

          context.font = fontStyle; // Use the memoized font style
          // context.font = `${textProps.isBold ? "bold" : ""} ${textProps.isItalic ? "italic" : ""} ${textProps.fontSize}px 'Pacifico', sans-serif`;

          context.fillStyle = textProps.textColor;
          context.textAlign = "center";
          context.fillText(displayName, textProps.posX, textProps.posY);

          if (textProps.isUnderline) {
            context.strokeStyle = textProps.textColor;
            context.lineWidth = 2;
            const textWidth = context.measureText(displayName).width;
            context.beginPath();
            context.moveTo(textProps.posX - textWidth / 2, textProps.posY + 2);
            context.lineTo(textProps.posX + textWidth / 2, textProps.posY + 2);
            context.stroke();
          }
        }
        const imageData = canvas.toDataURL("image/png");
        setGeneratedImage(imageData);
        if (isImageFinal) {
          setImageList((prevList) => {
            if (!prevList.includes(imageData)) {
              return [...prevList, imageData];
            }
            return prevList;
          });
        }
      };
    }
  }, [selectedImage, textProps, fontStyle, isImageFinal, isCapitalized]);

  const handleZipDownload = () => {
    const zip = new JSZip();

    imageList.forEach((imageData, index) => {
      const byteString = atob(imageData.split(",")[1]);
      const ab = new Uint8Array(byteString.length);

      for (let i = 0; i < byteString.length; i++) {
        ab[i] = byteString.charCodeAt(i);
      }

      zip.file(`${nameList[index].combined}.png`, ab, {
        binary: true,
      });
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "certificates.zip");
    });
  };

  useEffect(() => {
    if (selectedImage) {
      generateCertificate();
    }
  }, [
    selectedImage,
    textProps.name,
    textProps.fontSize,
    textProps.isBold,
    textProps.isItalic,
    textProps.isUnderline,
    textProps.selectedFont,
    textProps.posX,
    textProps.posY,
    textProps.textColor,
    nameList,
    isCapitalized,
  ]);

  useEffect(() => {
    console.log("isCapitalized:", isCapitalized);
  }, [isCapitalized]);

  if (!isOpen) return null;

  const handleDownload = (imageData: string) => {
    const a = document.createElement("a");
    a.href = imageData;
    a.download = `${textProps.name}.png`;
    a.click();
  };

  const handleNameList = (newNameList: { combined: string }[]) => {
    const updatedNameList = isCapitalized
      ? newNameList.map((item) => ({ combined: item.combined.toUpperCase() }))
      : newNameList;

    setNameList(updatedNameList);
    if (updatedNameList.length > 0) {
      setTextProps((prev) => ({ ...prev, name: updatedNameList[0].combined }));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = isCapitalized ? e.target.value.toUpperCase() : e.target.value;
    setTextProps((prev) => ({ ...prev, name }));
  };

  const handleFontSizeChange = (value: number) => {
    setTextProps((prev) => ({ ...prev, fontSize: value }));
  };

  const handleBoldToggle = () => {
    setTextProps((prev) => ({ ...prev, isBold: !prev.isBold }));
  };

  const handleItalicToggle = () => {
    setTextProps((prev) => ({ ...prev, isItalic: !prev.isItalic }));
  };

  const handleUnderlineToggle = () => {
    setTextProps((prev) => ({ ...prev, isUnderline: !prev.isUnderline }));
  };

  const handleFontFamilyChange = (font: string) => {
    setTextProps((prev) => ({ ...prev, selectedFont: font }));
  };

  const handleTextColorChange = (color: string) => {
    setTextProps((prev) => ({ ...prev, textColor: color }));
  };

  const handlePosX = (value: number) => {
    setTextProps((prev) => ({ ...prev, posX: value }));
  };

  const handlePosY = (value: number) => {
    setTextProps((prev) => ({ ...prev, posY: value }));
  };

  const handleFinalImage = (final: boolean) => {
    setIsImageFinal(final);
  };

  const handleCapitalization = (final: boolean) => {
    setIsCapitalized(!isCapitalized);
  };

  const handleCertificateUpload = async () => {
    try {
      // Iterate over the imageList
      for (let index = 0; index < imageList.length; index++) {
        const imageData = imageList[index];
        const byteString = atob(imageData.split(",")[1]);
        const ab = new Uint8Array(byteString.length);

        for (let i = 0; i < byteString.length; i++) {
          ab[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: "image/png" });

        // Generate a unique ID for the image
        // const uniqueId = `${nameList[index].combined}-${Date.now()}`;

        // Define the path in Supabase storage with custom folder name
        const filePath = `certificates/${folderName}/${nameList[index].combined}.png`;

        // Upload the image to Supabase storage
        const { error } = await supabase.storage
          .from("autocert")
          .upload(filePath, blob);

        if (error) {
          console.error("Error uploading image:", error.message);
        } else {
          console.log(`Image uploaded successfully: ${filePath}`);
        }
      }

      setIsImageUploaded(true); // Set the state to indicate images have been uploaded
    } catch (error) {
      console.error("Error in handleCertificateUpload:", error);
    }
  };
  const handleCertificateFetch = async () => {
    try {
      const folderPath = `certificates/${folderName}`; // Ensure correct path
      console.log("Fetching from:", folderPath);

      const { data, error } = await supabase.storage
        .from("autocert")
        .list(folderPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) {
        console.error("Error fetching certificates:", error.message);
        return;
      }

      console.log("List response:", data); // Log the response

      if (!data || data.length === 0) {
        console.warn("No certificates found in:", folderPath);
        return;
      }

      const certificateUrls = data
        .filter(
          (file) =>
            file.name.endsWith(".png") ||
            file.name.endsWith(".jpg") ||
            file.name.endsWith(".jpeg")
        )
        .map((file) => {
          const { data } = supabase.storage
            .from("autocert")
            .getPublicUrl(`${folderPath}/${file.name}`);

          return data.publicUrl;
        });

      console.log("Fetched URLs:", certificateUrls);
      setFetchedCertificates(certificateUrls);
      setIsViewCertificatesDialogOpen(true);
    } catch (error) {
      console.error("Error in handleCertificateFetch:", error);
    }
  };

  const handleCertificateDelete = async () => {};

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div
        id="modal-content"
        className="bg-white p-4 rounded shadow-lg lg:max-w-[1000px] w-full relative"
      >
        <button
          id="modal-close-button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          <XIcon className="w-4 h-4" />
        </button>
        <div className="lg:h-[585 px] overflow-y-auto w-full p-2 ">
          <div className="grid grid-cols-3 grid-flow-col gap-4">
            <div className="p-2 col-span-2 ">
              {generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated Certificate"
                  className="w-full"
                />
              ) : (
                <img
                  src={DefaultCert.src}
                  alt="Certificate"
                  className="w-full"
                />
              )}
            </div>

            <div className="col-span-1 border border-gray-300 bg-white rounded-lg shadow-sm p-4">
              <div className="items-center justify-center">
                <Toolbar
                  setNameList={handleNameList}
                  handleImageUpload={handleImageUpload}
                  handleNameChange={handleNameChange}
                  handleFontSizeChange={handleFontSizeChange}
                  handleBoldToggle={handleBoldToggle}
                  handleItalicToggle={handleItalicToggle}
                  handleUnderlineToggle={handleUnderlineToggle}
                  handleFontFamilyChange={handleFontFamilyChange}
                  handlePosX={handlePosX}
                  handlePosY={handlePosY}
                  handleTextColorChange={handleTextColorChange}
                  handleFinalImage={handleFinalImage}
                  handleCapitalization={handleCapitalization}
                  isCapitalized={isCapitalized}
                  name={textProps.name}
                  fontSize={textProps.fontSize}
                  selectedFont={textProps.selectedFont}
                  isBold={textProps.isBold}
                  isItalic={textProps.isItalic}
                  isUnderline={textProps.isUnderline}
                  posX={textProps.posX}
                  posY={textProps.posY}
                  textColor={textProps.textColor}
                  isImageFinal={isImageFinal}
                />
              </div>
            </div>
          </div>

          {/* New Row Layout for Buttons and Dialog */}
          {isImageFinal && (
            <div className="flex justify-end gap-2  p-2 mt-2">
              <Button
                asChild
                size="default"
                variant={"secondary"}
                className="cursor-pointer"
                onClick={handleGenerate}
              >
                <p>Generate</p>
              </Button>
              <Button
                asChild
                size="default"
                variant={"secondary"}
                disabled={!generatedImage}
                className="cursor-pointer"
                onClick={() => generatedImage && handleDownload(generatedImage)}
              >
                <p>Download</p>
              </Button>
            </div>
          )}

          <Dialog open={imageListModal} onOpenChange={setImageListModal}>
            <DialogContent className="sm:max-w-[425px] max-h-[500px] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  {imageList.map((imageData, index) => (
                    <li key={index}>
                      <img
                        src={imageData}
                        alt={`Image ${index + 1}`}
                        className="w-full"
                      />
                    </li>
                  ))}
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button type="submit" onClick={handleZipDownload}>
                  Download All
                </Button>
                <Button
                  type="submit"
                  onClick={() => setIsFolderNameDialogOpen(true)}
                >
                  Save All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isFolderNameDialogOpen}
            onOpenChange={setIsFolderNameDialogOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Name folder</DialogTitle>
                <DialogDescription>
                  Add names to your folder here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="folderName" className="text-right">
                    Folder Name
                  </Label>
                  <Input
                    id="folderName"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={() => {
                    setIsFolderNameDialogOpen(false);
                    handleCertificateUpload();
                  }}
                >
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isImageUploaded} onOpenChange={setIsImageUploaded}>
            <DialogContent className="sm:max-w-[425px] max-h-[500px] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Image Uploaded Successfully!</DialogTitle>
                <DialogDescription>
                  Congrats! You have successfully uploaded the certificates to
                  supabase!
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button type="submit" onClick={handleCertificateFetch}>
                  View Certificates
                </Button>
                <Button type="submit" onClick={handleCertificateDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isViewCertificatesDialogOpen}
            onOpenChange={setIsViewCertificatesDialogOpen}
          >
            <DialogContent className="sm:max-w-[425px] max-h-[500px] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>View Certificates</DialogTitle>
                <DialogDescription>
                  {fetchedCertificates.map((url, index) => (
                    <li key={index}>
                      <img
                        src={url}
                        alt={`Certificate ${index + 1}`}
                        className="w-full"
                      />
                    </li>
                  ))}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={() => setIsViewCertificatesDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
