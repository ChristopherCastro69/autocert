import { FunctionComponent } from "react";
import UploadCertificate from "./upload-certificate";
import UploadRecipient from "../upload-recipient";

interface ToolbarProps {
  fontSize?: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textColor?: string;
  selectedFont?: string;
  generatedImage?: boolean;
}

export function Toolbar({
  fontSize = 16,
  isBold = false,
  isItalic = false,
  isUnderline = false,
  textColor = "#000000",
  selectedFont = "Arial",
  generatedImage = false,
}: ToolbarProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Add your name change logic here
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Add your color change logic here
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Add your font change logic here
  };

  return (
    <div className="flex-row items-center justify-center h-full text-sm ">
      <div className=" mb-4">
        <UploadRecipient />
      </div>
      <div className="border-t border-gray-300 w-full flex-row">
        <p>Position</p>
      </div>
      <div className="border-t border-gray-300 w-full flex-row">
        <p>Typography</p>
      </div>
      <div className="border-t border-gray-300 w-full flex-row">
        <p>Fill</p>
      </div>
    </div>
  );
}

export default Toolbar;
