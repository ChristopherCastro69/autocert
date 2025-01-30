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
  setNameList: (data: any[]) => void;
  handleImageUpload: (file: File) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFontSizeChange: (size: number) => void;
  handleFontFamilyChange: (font: string) => void;
  handleBoldToggle: () => void;
  handleItalicToggle: () => void;
  handleUnderlineToggle: () => void;
  handleTextColorChange: (color: string) => void;
  handlePosX: (value: number) => void;
  handlePosY: (value: number) => void;
  handleFinalImage: () => void;
  name: string;
  fontSize: number;
  selectedFont: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  posX: number;
  posY: number;
  textColor: string;
  isImageFinal: boolean;
}

const fontOptions = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Verdana",
];
const fontSizeOptions = [
  16, 18, 20, 24, 28, 32, 36, 48, 56, 72, 96, 100, 128, 156, 200,
];

const Toolbar: React.FC<ToolbarProps> = ({
  setNameList,
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
  handleFinalImage,
  fontSize,
  isBold,
  isItalic,
  isUnderline,
  isImageFinal,
  textColor,
}) => {
  return (
    <div className="flex-row items-center justify-center h-full text-sm space-y-4 ">
      <div className="mb-1">
        <UploadRecipient setDisplayData={setNameList} />
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
          <Slider
            min={0}
            defaultValue={[500]}
            max={2500}
            step={1}
            onValueChange={(value) => handlePosX(value[0])}
          />
        </div>

        <div className="space-y-1">
          <p>Y-axis</p>
          <Slider
            min={0}
            defaultValue={[500]}
            max={2000}
            step={1}
            onValueChange={(value) => handlePosY(value[0])}
          />
        </div>
      </div>
      <div className="border-t border-gray-300 w-full flex-row space-y-2">
        <p className="mt-2">Typography</p>
        <div className="lg:flex flex-row  items-center space-x-2 ">
          <div className="flex space-x-2">
            <Select onValueChange={handleFontFamilyChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CustomSelect
              options={fontSizeOptions}
              value={fontSize}
              onChange={handleFontSizeChange}
            />
          </div>

          <div className="flex lg:mt-0 mt-2 space-x-1">
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
      </div>
      <div className="border-t border-gray-300 w-full flex-row space-y-2">
        <p className="mt-2">Fill</p>

        <ColorPicker color={textColor} onChange={handleTextColorChange} />
        <Button
          variant={"typography"}
          size={"full"}
          className={`${isImageFinal ? "bg-gray-200 text-black" : "bg-white text-grey"} hover:bg-gray-200 focus:ring-black`}
          onClick={handleFinalImage}
        >
          <p className="">Finalize Image</p>
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
