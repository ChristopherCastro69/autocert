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

interface CertificateCardProps {
  isOpen: boolean;
  onClose: () => void;
}

function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export function CertificateCard({ isOpen, onClose }: CertificateCardProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>();
  const [imageList, setImageList] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [nameList, setNameList] = useState<{ combined: string }[]>([]);
  const [name, setName] = useState<string>(() =>
    nameList.length > 0 ? nameList[0].combined : "John Nommensen Duchac"
  );
  const [fontSize, setFontSize] = useState<number>(24);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [textColor, setTextColor] = useState<string>("#000000");
  const [selectedFont, setSelectedFont] = useState<string>("Arial");
  const [posX, setPosX] = useState<number>(40);
  const [posY, setPosY] = useState<number>(80);
  const [isImageFinal, setIsImageFinal] = useState<boolean>(false);
  const [imageListModal, setImageListModal] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [initialMousePos, setInitialMousePos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [initialPos, setInitialPos] = useState<{ x: number; y: number }>({
    x: posX,
    y: posY,
  });

  // Memoize the font style to avoid recalculating on every render
  const fontStyle = useMemo(() => {
    return `${isBold ? "bold" : ""} ${isItalic ? "italic" : ""} ${fontSize}px ${selectedFont}`;
  }, [isBold, isItalic, fontSize, selectedFont]);

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

      setName(nameList[index].combined);
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

          context.font = fontStyle; // Use the memoized font style
          context.fillStyle = `${textColor}`;
          context.textAlign = "center";
          context.fillText(name, posX, posY);

          if (isUnderline) {
            context.strokeStyle = textColor;
            context.lineWidth = 2;
            const textWidth = context.measureText(name).width;
            context.beginPath();
            context.moveTo(posX - textWidth / 2, posY + 2);
            context.lineTo(posX + textWidth / 2, posY + 2);
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
  }, [selectedImage, name, fontStyle, posX, posY, textColor, isImageFinal]);

  // Debounce the generateCertificate function
  const debouncedGenerateCertificate = useCallback(
    debounce(generateCertificate, 50),
    [generateCertificate]
  );

  useEffect(() => {
    if (selectedImage) {
      debouncedGenerateCertificate();
    }
  }, [
    selectedImage,
    name,
    fontSize,
    isBold,
    isItalic,
    isUnderline,
    selectedFont,
    posX,
    posY,
    textColor,
    nameList,
  ]);

  const handleZipDownload = () => {
    const zip = new JSZip();

    imageList.forEach((imageData, index) => {
      const byteString = atob(imageData.split(",")[1]);
      const ab = new Uint8Array(byteString.length);

      for (let i = 0; i < byteString.length; i++) {
        ab[i] = byteString.charCodeAt(i);
      }

      zip.file(`certificate_${index + 1}.png`, ab, { binary: true });
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
    name,
    fontSize,
    isBold,
    isItalic,
    isUnderline,
    selectedFont,
    posX,
    posY,
    textColor,
    nameList,
  ]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setInitialPos({ x: posX, y: posY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && initialMousePos) {
      const dx = e.clientX - initialMousePos.x;
      const dy = e.clientY - initialMousePos.y;
      setPosX(initialPos.x + dx);
      setPosY(initialPos.y + dy);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setInitialMousePos(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  const handleDownload = (imageData: string) => {
    const a = document.createElement("a");
    a.href = imageData;
    a.download = `${name}.png`;
    a.click();
  };

  const handleNameList = (newNameList: { combined: string }[]) => {
    setNameList(newNameList);
    if (newNameList.length > 0) {
      setName(newNameList[0].combined);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const handleFontSizeChange = (value: number) => {
    setFontSize(value);
  };
  const handleBoldToggle = () => {
    setIsBold(!isBold);
  };

  const handleItalicToggle = () => {
    setIsItalic(!isItalic);
  };
  const handleFinalImage = () => {
    setIsImageFinal(!isImageFinal);
  };

  const handleUnderlineToggle = () => {
    setIsUnderline(!isUnderline);
  };

  const handleFontFamilyChange = (font: string) => {
    setSelectedFont(font);
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
  };
  const handlePosX = (value: number) => {
    setPosX(value);
  };

  const handlePosY = (value: number) => {
    setPosY(value);
  };

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
        <div
          className="lg:h-[550px] overflow-y-auto w-full p-2 "
          onMouseDown={handleMouseDown}
        >
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
                  name={name}
                  fontSize={fontSize}
                  selectedFont={selectedFont}
                  isBold={isBold}
                  isItalic={isItalic}
                  isUnderline={isUnderline}
                  posX={posX}
                  posY={posY}
                  textColor={textColor}
                  isImageFinal={isImageFinal}
                />
              </div>
              <div className="absolute bottom-0 right-2 flex gap-2 p-4">
                <Button
                  asChild
                  size="sm"
                  variant={"secondary"}
                  className="cursor-pointer"
                  onClick={handleGenerate}
                >
                  <p>Generate</p>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant={"secondary"}
                  disabled={!generatedImage}
                  className="cursor-pointer"
                  onClick={() =>
                    generatedImage && handleDownload(generatedImage)
                  }
                >
                  <p>Download</p>
                </Button>

                <Dialog open={imageListModal} onOpenChange={setImageListModal}>
                  {/* <DialogTrigger asChild>
                    <Button variant="outline">Edit Profile</Button>
                  </DialogTrigger> */}
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
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
