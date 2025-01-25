import React, { useState } from "react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [placeholder, setPlaceholder] = useState(color);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(newColor) || newColor === "") {
      onChange(newColor);
      setPlaceholder(newColor);
    }
  };

  return (
    <div className="flex items-center space-x-2 border rounded-sm w-32 px-1">
      <input
        type="color"
        value={color}
        onChange={handleColorChange}
        className=" h-7 w-7 border-none cursor-pointer"
      />
      <input
        type="text"
        value={color}
        onChange={handleInputChange}
        placeholder={placeholder || "#FFFFFF"}
        className="h-7 w-20 rounded text-center border-none focus:border-none outline-none"
      />
    </div>
  );
};

export default ColorPicker;
