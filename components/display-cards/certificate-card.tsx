import React, { useEffect, useRef } from "react";

interface CertificateCardProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export function CertificateCard({
  isOpen,
  onClose,
  imageUrl,
}: CertificateCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (imageUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        if (context) {
          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0);
        }
      };
    }
  }, [imageUrl]);

  if (!isOpen) return null;

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div
        id="modal-content"
        className="bg-white p-4 rounded shadow-lg max-w-2xl w-full relative"
      >
        <button
          id="modal-close-button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>
        <div className="h-auto overflow-y-auto p-2 flex justify-center items-center">
          <canvas ref={canvasRef} className="border" />
        </div>
      </div>
    </div>
  );
}
