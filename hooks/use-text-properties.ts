// hooks/use-text-properties.ts
import { useState, useCallback, ChangeEvent } from "react";

interface TextProperties {
  name: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  textColor: string;
  selectedFont: string;
  posX: number;
  posY: number;
}

export function useTextProperties(initialName: string) {
  const [textProps, setTextProps] = useState<TextProperties>({
    name: initialName,
    fontSize: 100,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    textColor: "#000000",
    selectedFont: "Arial",
    posX: 500,
    posY: 300,
  });

  const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setTextProps((prev: TextProperties) => ({ ...prev, name }));
  }, []);

  const handleFontSizeChange = useCallback((fontSize: number) => {
    setTextProps((prev: TextProperties) => ({ ...prev, fontSize }));
  }, []);

  const handleBoldToggle = useCallback(() => {
    setTextProps((prev: TextProperties) => ({ ...prev, isBold: !prev.isBold }));
  }, []);

  const handleItalicToggle = useCallback(() => {
    setTextProps((prev: TextProperties) => ({
      ...prev,
      isItalic: !prev.isItalic,
    }));
  }, []);

  const handleUnderlineToggle = useCallback(() => {
    setTextProps((prev: TextProperties) => ({
      ...prev,
      isUnderline: !prev.isUnderline,
    }));
  }, []);

  const handleFontFamilyChange = useCallback((selectedFont: string) => {
    setTextProps((prev: TextProperties) => ({ ...prev, selectedFont }));
  }, []);

  const handleTextColorChange = useCallback((textColor: string) => {
    setTextProps((prev: TextProperties) => ({ ...prev, textColor }));
  }, []);

  const handlePosX = useCallback((posX: number) => {
    setTextProps((prev: TextProperties) => ({ ...prev, posX }));
  }, []);

  const handlePosY = useCallback((posY: number) => {
    setTextProps((prev: TextProperties) => ({ ...prev, posY }));
  }, []);

  return {
    textProps,
    handleNameChange,
    handleFontSizeChange,
    handleBoldToggle,
    handleItalicToggle,
    handleUnderlineToggle,
    handleFontFamilyChange,
    handleTextColorChange,
    handlePosX,
    handlePosY,
  };
}
