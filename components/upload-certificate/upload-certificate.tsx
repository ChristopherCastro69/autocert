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
