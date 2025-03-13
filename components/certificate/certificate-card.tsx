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
import { useUser } from "@/components/context/UserContext";
import { UserProfile } from "../../dto/UserProfilesDTO";
import {
  CertificateDialog,
  UploadSuccessDialog,
  FolderNameDialog,
  ViewCertificatesDialog,
} from "../ui/dialog-component";
import { useTextProperties } from "../../hooks/use-text-properties";
import { useSupabaseCertificates } from "../../hooks/usa-supabase-certificates";

interface SupabaseData {
  id: number; // Assuming each entry has a unique 'id' field
  name: string;
  email: string;
}
interface CertificateCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CertificateCard({ isOpen, onClose }: CertificateCardProps) {
  const { user } = useUser();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>();
  const [imageList, setImageList] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const {
    textProps,
    handleNameChange,
    handleFontSizeChange,
    handleBoldToggle,
    handleItalicToggle,
    handleUnderlineToggle,
    handleFontFamilyChange,
    handleTextColorChange,
    handlePosX,
    handlePosY,
  } = useTextProperties("John Nommensen Duchac");

  const [isImageFinal, setIsImageFinal] = useState<boolean>(false);
  const [imageListModal, setImageListModal] = useState<boolean>(false);
  const [isCapitalized, setIsCapitalized] = useState<boolean>(false);
  const [isImageUploaded, setIsImageUploaded] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");
  const [isFolderNameDialogOpen, setIsFolderNameDialogOpen] =
    useState<boolean>(false);
  const [isViewCertificatesDialogOpen, setIsViewCertificatesDialogOpen] =
    useState<boolean>(false);
  const [nameLists, setNameLists] = useState<string[]>([]);
  const [emailList, setEmailList] = useState<string[]>([]);
  const [supabaseList, setSupabaseList] = useState<SupabaseData[]>([]); // Updated type here

  // Initialize the Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const {
    isImageUploaded: supabaseCertIsImageUploaded,
    fetchedCertificates: supabaseCertFetchedCertificates,
    uploadCertificates,
    fetchCertificates,
  } = useSupabaseCertificates();

  useEffect(() => {
    if (supabaseList.length > 0) {
      handleNameChange({
        target: { value: supabaseList[0].name },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [user, supabaseList, handleNameChange]);

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
    const count = nameLists.length;

    if (count === 0) {
      return;
    }

    setIsDownloading(true);

    const generateAndDownload = (index: number) => {
      if (index >= count) {
        setImageListModal(true);
        return;
      }

      const name = nameLists[index];
      handleNameChange({
        target: { value: name },
      } as React.ChangeEvent<HTMLInputElement>);

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

      zip.file(`${nameLists[index]}.png`, ab, {
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
    isCapitalized,
  ]);

  if (!isOpen) return null;

  const handleDownload = (imageData: string) => {
    const a = document.createElement("a");
    a.href = imageData;
    a.download = `${textProps.name}.png`;
    a.click();
  };

  const handleFinalImage = (final: boolean) => {
    setIsImageFinal(final);
  };

  const handleCapitalization = (final: boolean) => {
    setIsCapitalized(!isCapitalized);
  };

  const handleCertificateUpload = () => {
    uploadCertificates(imageList, folderName, nameLists, setIsImageUploaded);
  };

  const handleCertificateFetch = () => {
    fetchCertificates(folderName, setIsViewCertificatesDialogOpen);
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
        <div className="lg:h-[585px] overflow-y-auto w-full p-2 ">
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
              {user && (
                <div className="flex flex-col">
                  <p>Id: {user.id}</p>
                  <p>Name: {user.profile?.full_name}</p>
                  <p>Email: {user.email}</p>
                </div>
              )}
            </div>

            <div className="col-span-1 border border-gray-300 bg-white rounded-lg shadow-sm p-4">
              <div className="items-center justify-center">
                <Toolbar
                  supabaseList={setSupabaseList}
                  setNameLists={setNameLists}
                  setEmailList={setEmailList}
                  nameLists={nameLists}
                  emailList={emailList}
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

          <CertificateDialog
            imageListModal={imageListModal}
            setImageListModal={setImageListModal}
            imageList={imageList}
            handleZipDownload={handleZipDownload}
            setIsFolderNameDialogOpen={setIsFolderNameDialogOpen}
          />

          <FolderNameDialog
            isFolderNameDialogOpen={isFolderNameDialogOpen}
            setIsFolderNameDialogOpen={setIsFolderNameDialogOpen}
            folderName={folderName}
            setFolderName={setFolderName}
            handleCertificateUpload={handleCertificateUpload}
          />

          <UploadSuccessDialog
            isImageUploaded={isImageUploaded}
            setIsImageUploaded={setIsImageUploaded}
            handleCertificateFetch={handleCertificateFetch}
            handleCertificateDelete={handleCertificateDelete}
          />

          <ViewCertificatesDialog
            isViewCertificatesDialogOpen={isViewCertificatesDialogOpen}
            setIsViewCertificatesDialogOpen={setIsViewCertificatesDialogOpen}
            fetchedCertificates={supabaseCertFetchedCertificates}
          />
        </div>
      </div>
    </div>
  );
}
