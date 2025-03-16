import { useState, useCallback } from "react";

export function useImageUpload() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageUpload = useCallback((file: File) => {
    setSelectedImage(file);
  }, []);

  return { selectedImage, handleImageUpload };
}