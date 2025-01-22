import React, { useState, useEffect } from "react";
import Toolbar from "../toolbar";
import GoogleCert from "./../../app/public/images/gdg-cert.png";
import { Button } from "../ui/button";
import { XIcon } from "lucide-react";

interface CertificateCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CertificateCard({ isOpen, onClose }: CertificateCardProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [name, setName] = useState<string | "error">("error");
  const [fontSize, setFontSize] = useState<number>(100);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [textColor, setTextColor] = useState<string>("#000000");
  const [selectedFont, setSelectedFont] = useState<string>("Arial");
  const [posX, setPosX] = useState<number>(300);
  const [posY, setPosY] = useState<number>(300);

  const handleImageUpload = (file: File) => {
    setSelectedImage(file);
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
  ]);
  if (!isOpen) return null;

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

  const generateCertificate = () => {
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

          context.font = ` ${isBold ? "bold" : ""} ${isItalic ? "italic" : ""} ${fontSize}px ${selectedFont}`;
          context.fillStyle = `${textColor}`;
          context.fillText(name, posX, posY);

          if (isUnderline) {
            context.strokeStyle = textColor;
            context.lineWidth = 2;
            const textWidth = context.measureText(name).width;
            context.beginPath();
            context.moveTo(posX, posY + 2);
            context.lineTo(posX + textWidth, posY + 2);
            context.stroke();
          }
          setGeneratedImage(canvas.toDataURL("image/png"));
        }
      };
    }
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
        <div className="lg:h-[550px] overflow-y-auto w-full p-2">
          <div className="grid grid-cols-3 grid-flow-col">
            <div className="p-4 col-span-2">
              {generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated Certificate"
                  className="w-full"
                />
              ) : (
                <img
                  src={GoogleCert.src}
                  alt="Certificate"
                  className="w-full"
                />
              )}
            </div>
            <div className="col-span-1 border border-gray-300 bg-white rounded-lg shadow-sm p-4">
              <div className="items-center justify-center">
                <Toolbar
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
                  name={""}
                  fontSize={0}
                  selectedFont={""}
                  isBold={isBold}
                  isItalic={isItalic}
                  isUnderline={isUnderline}
                  posX={0}
                  posY={0}
                  textColor={""}
                />
              </div>
              <div className="absolute bottom-0 right-2 flex gap-2 p-4">
                <Button
                  asChild
                  size="sm"
                  variant={"secondary"}
                  disabled={!generatedImage}
                  className="cursor-pointer"
                >
                  <p>Generate</p>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
