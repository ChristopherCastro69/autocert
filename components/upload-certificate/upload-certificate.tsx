import React, { useRef } from "react";
import { Button } from "../ui/button";
import { useImageUpload } from "./useImageUpload";

interface UploadCertificateProps {
  handleImageUpload: (file: File) => void;
}

const UploadCertificate: React.FC<UploadCertificateProps> = ({
  handleImageUpload,
}) => {
  const { fileInputRef, handleImageChange, triggerFileInput } =
    useImageUpload(handleImageUpload);

  function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ) {
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

  return (
    <div>
      <Button
        type="button"
        variant={"ghost"}
        size={"full"}
        onClick={triggerFileInput}
      >
        Upload Certificate Template
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleImageChange}
      />
    </div>
  );
};

export default UploadCertificate;
