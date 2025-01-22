import React, { useState, useRef, useEffect } from "react";

interface CustomSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        className="h-10 w-[70px] border border-gray-300 rounded-md text-center pr-8 focus:outline-none focus:ring-2  cursor-pointer"
        placeholder="Size"
      />
      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 9l6 6 6-6"
          />
        </svg>
      </span>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleSelect(option)}
              className="cursor-pointer hover:bg-gray-200 p-2 rounded-md transition-colors"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
