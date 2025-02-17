import UploadRecipient from "./recipient/upload-recipient";
import UploadCertificate from "./upload-certificate/upload-certificate";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Bold, CheckIcon, Italic, Underline } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import CustomSelect from "./ui/custom-select";
import ColorPicker from "./ui/color-picker";
import { Checkbox } from "./ui/checkbox";

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
  handleFinalImage: (final: boolean) => void;
  handleCapitalization: (final: boolean) => void;
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
  isCapitalized: boolean;
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
  handleCapitalization,
  isCapitalized,
  fontSize,
  isBold,
  isItalic,
  isUnderline,
  isImageFinal,
  textColor,
  posX,
  posY,
}) => {
  const [xValue, setXValue] = useState(posX);
  const [yValue, setYValue] = useState(posY);

  useEffect(() => {
    setXValue(posX);
  }, [posX]);

  useEffect(() => {
    setYValue(posY);
  }, [posY]);

  return (
    <div className="flex-row items-center justify-center h-full text-sm space-y-3 ">
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
          disabled={isImageFinal}
        />
      </div>
      <div className="flex items-center space-x-2 mt-2">
        <label
          htmlFor="capitalize"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Capitalize?
        </label>
        <Checkbox
          id="capitalize"
          checked={isCapitalized}
          onCheckedChange={handleCapitalization}
          disabled={isImageFinal}
        />
      </div>
      <div className=" border-gray-300 border-t w-full flex-row space-y-2">
        <p className="mt-2 font-bold">Position</p>
        <div className="space-y-1">
          <p>X-axis</p>
          <div className="flex items-center space-x-2">
            <Slider
              min={0}
              value={[xValue]}
              max={2500}
              step={50}
              onValueChange={(value) => {
                if (!isImageFinal) {
                  setXValue(value[0]);
                  handlePosX(value[0]);
                }
              }}
            />
            <input
              type="number"
              value={xValue}
              onChange={(e) => {
                if (!isImageFinal) {
                  const value = Math.max(
                    0,
                    Math.min(2500, Number(e.target.value))
                  );
                  setXValue(value);
                  handlePosX(value);
                }
              }}
              className="border rounded p-1 w-16"
              disabled={isImageFinal}
            />
          </div>
        </div>

        <div className="space-y-1">
          <p>Y-axis</p>
          <div className="flex items-center space-x-2">
            <Slider
              min={0}
              value={[yValue]}
              max={2000}
              step={1}
              onValueChange={(value) => {
                setYValue(value[0]);
                handlePosY(value[0]);
              }}
            />
            <input
              type="number"
              value={yValue}
              onChange={(e) => {
                const value = Math.max(
                  0,
                  Math.min(2000, Number(e.target.value))
                );
                setYValue(value);
                handlePosY(value);
              }}
              className="border rounded p-1 w-16"
            />
          </div>
        </div>
      </div>
      <div className="border-t border-gray-300 w-full flex-row space-y-2">
        <p className="mt-2 font-bold">Typography</p>
        <div className="lg:flex flex-row  items-center space-x-2 ">
          <div className="flex space-x-2">
            <Select
              onValueChange={handleFontFamilyChange}
              disabled={isImageFinal}
            >
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
              disabled={isImageFinal}
            />
          </div>

          <div className="flex lg:mt-0 mt-2 space-x-1">
            <Button
              size={"xs"}
              variant="typography"
              className={`${isBold ? "bg-gray-200 text-black" : "bg-white text-black"} hover:bg-gray-200 focus:ring-black`}
              onClick={handleBoldToggle}
              disabled={isImageFinal}
            >
              <Bold />
            </Button>
            <Button
              size={"xs"}
              variant={"typography"}
              className={`${isItalic ? "bg-gray-200 text-black" : "bg-white text-black"} hover:bg-gray-200 focus:ring-black`}
              onClick={handleItalicToggle}
              disabled={isImageFinal}
            >
              <Italic />
            </Button>
            <Button
              size={"xs"}
              variant={"typography"}
              className={`${isUnderline ? "bg-gray-200 text-black" : "bg-white text-black"} hover:bg-gray-200 focus:ring-black`}
              onClick={handleUnderlineToggle}
              disabled={isImageFinal}
            >
              <Underline />
            </Button>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-300 w-full flex-row space-y-2">
        <p className="mt-2 font-bold">Fill</p>

        <ColorPicker
          color={textColor}
          onChange={handleTextColorChange}
          disabled={isImageFinal}
        />
      </div>

      <div className="w-full flex space-y-2 gap-2 flex-col">
        <div className="flex justify-between gap-2 w-full mt-2">
          <Button
            variant={"outline"}
            size={"full"}
            className={`${isImageFinal ? "bg-gray-200 text-black" : "bg-white text-grey"} hover:bg-gray-200 focus:ring-black`}
            onClick={() => handleFinalImage(true)}
            disabled={isImageFinal}
          >
            <p className="flex items-center">
              {isImageFinal ? (
                <>
                  <span className="mr-1">Saved</span>
                  <CheckIcon />
                </>
              ) : (
                "Save"
              )}
            </p>
          </Button>
          <Button
            variant={"outline"}
            size={"full"}
            onClick={() => handleFinalImage(false)}
          >
            <p className="">Edit</p>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
