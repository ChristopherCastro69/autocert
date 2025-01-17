import React, { useRef } from "react";
import { Button } from "../ui/button";

interface UploadCertificateProps {
  handleImageUpload: (file: File) => void;
}

const UploadCertificate: React.FC<UploadCertificateProps> = ({
  handleImageUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <Button
        type="button"
        variant={"ghost"}
        size={"full"}
        onClick={handleButtonClick}
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
