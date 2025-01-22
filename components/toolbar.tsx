import UploadRecipient from "./recipient/upload-recipient";
import UploadCertificate from "./certificate/upload-certificate";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Bold, Italic, Underline } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import CustomSelect from "./ui/custom-select";
import ColorPicker from "./ui/color-picker";

interface ToolbarProps {
  handleImageUpload: (file: File) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFontSizeChange: () => void;
  handleFontFamilyChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleBoldToggle: () => void;
  handleItalicToggle: () => void;
  handleUnderlineToggle: () => void;
  handleTextColorChange: (color: string) => void;
  handlePosX: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePosY: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  fontSize: number;
  selectedFont: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  posX: number;
  posY: number;
  textColor: string;
}

const fonts = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Verdana",
];
const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 56, 72, 96, 128];

const Toolbar: React.FC<ToolbarProps> = ({
  handleImageUpload,
  handleNameChange,
  handleFontSizeChange,
  handleFontFamilyChange,
  handleBoldToggle,
  handleItalicToggle,
  handleUnderlineToggle,
  handleTextColorChange,
  handlePosX,
  handlePosY,
  name,
  fontSize,
  selectedFont,
  isBold,
  isItalic,
  isUnderline,
  posX,
  posY,
  textColor,
}) => {
  return (
    <div className="flex-row items-center justify-center h-full text-sm space-y-4 ">
      <div className="mb-1">
        <UploadRecipient />
      </div>
      <div className="mb-8">
        <UploadCertificate handleImageUpload={handleImageUpload} />
      </div>
      <div className="border-b border-gray-300 w-full flex-row">
        <input
          type="text"
          placeholder="Sample Name"
          className="border rounded p-1 focus:outline-none border-none"
          onChange={handleNameChange}
        />
      </div>
      <div className=" border-gray-300 w-full flex-row space-y-2">
        <p className="mt-2">Position</p>
        <div className="space-y-1">
          <p>X-axis</p>
          <Slider defaultValue={[33]} max={100} step={1} />
        </div>

        <div className="space-y-1">
          <p>Y-axis</p>

          <Slider defaultValue={[33]} max={100} step={1} />
        </div>
      </div>
      <div className="border-t border-gray-300 w-full flex-row space-y-2">
        <p className="mt-2">Typography</p>
        <div className="flex items-center space-x-2">
          <Select>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
            </SelectContent>
          </Select>
          <CustomSelect
            options={fontSizes.map((size) => size.toString())}
            value={fontSize.toString()}
            onChange={handleFontSizeChange}
          />
          <Button
            size={"xs"}
            variant="typography"
            className={`${isBold ? "bg-gray-200 text-black" : "bg-white text-black"} hover:bg-gray-200 focus:ring-black`}
            onClick={handleBoldToggle}
          >
            <Bold />
          </Button>
          <Button
            size={"xs"}
            variant={"typography"}
            className={`${isItalic ? "bg-gray-200 text-black" : "bg-white text-black"} hover:bg-gray-200 focus:ring-black`}
            onClick={handleItalicToggle}
          >
            <Italic />
          </Button>
          <Button
            size={"xs"}
            variant={"typography"}
            className={`${isUnderline ? "bg-gray-200 text-black" : "bg-white text-black"} hover:bg-gray-200 focus:ring-black`}
            onClick={handleUnderlineToggle}
          >
            <Underline />
          </Button>
        </div>
      </div>
      <div className="border-t border-gray-300 w-full flex-row space-y-2">
        <p className="mt-2">Fill</p>

        <ColorPicker color={textColor} onChange={handleTextColorChange} />
      </div>
    </div>
  );
};

export default Toolbar;
