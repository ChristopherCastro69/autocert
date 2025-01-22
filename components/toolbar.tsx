import { FunctionComponent, useState } from "react";
import UploadRecipient from "./recipient/upload-recipient";
import UploadCertificate from "./certificate/upload-certificate";
import { CertificateCard } from "./certificate/certificate-card";

interface ToolbarProps {
  handleImageUpload: (file: File) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ handleImageUpload }) => {
  return (
    <div className="flex-row items-center justify-center h-full text-sm space-y-4 ">
      <div className="mb-1">
        <UploadRecipient />
      </div>
      <div className="mb-8">
        <UploadCertificate handleImageUpload={handleImageUpload} />
      </div>

      <div className="border-b border-gray-300 w-full flex-row">
        <p>Position</p>
      </div>
      <div className="border-b border-gray-300 w-full flex-row">
        <p>Typography</p>
      </div>
      <div className="border-b border-gray-300 w-full flex-row">
        <p>Fill</p>
      </div>
    </div>
  );
};

export default Toolbar;
