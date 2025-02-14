import { useRef } from "react";

export const useImageUpload = (onUpload: (file: File) => void) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return { fileInputRef, handleImageChange, triggerFileInput };
};