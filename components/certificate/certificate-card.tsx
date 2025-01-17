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

  const handleImageUpload = (file: File) => {
    setSelectedImage(file);
  };

  useEffect(() => {
    if (selectedImage) {
      generateCertificate();
    }
  }, [selectedImage]);
  if (!isOpen) return null;

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
          // Additional drawing logic can go here if needed

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
                <Toolbar handleImageUpload={handleImageUpload} />
              </div>
              <div className="absolute bottom-0 right-2 flex gap-2 p-4">
                <Button
                  asChild
                  size="sm"
                  variant={"secondary"}
                  disabled={!generatedImage} // Enable button only if an image is generated
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
