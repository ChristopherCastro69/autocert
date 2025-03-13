// hooks/use-certificate-processor.ts
import { useCallback, useEffect } from "react";

export function useCertificateProcessor(
  selectedImage: File | null,
  textProps: any,
  fontStyle: string,
  isImageFinal: boolean,
  isCapitalized: boolean,
  setGeneratedImage: (value: string | null) => void,
  setImageList: (value: (prevList: string[]) => string[]) => void,
  nameLists: string[],
  handleNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  setImageListModal: (value: boolean) => void
) {
  const generateCertificate = useCallback(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (selectedImage) {
      const image = new Image();
      image.src = URL.createObjectURL(selectedImage);

      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;

        if (context) {
          context.drawImage(image, 0, 0);

          const displayName = isCapitalized
            ? textProps.name.toUpperCase()
            : textProps.name;

          context.font = fontStyle;
          context.fillStyle = textProps.textColor;
          context.textAlign = "center";
          context.fillText(displayName, textProps.posX, textProps.posY);

          if (textProps.isUnderline) {
            context.strokeStyle = textProps.textColor;
            context.lineWidth = 2;
            const textWidth = context.measureText(displayName).width;
            context.beginPath();
            context.moveTo(textProps.posX - textWidth / 2, textProps.posY + 2);
            context.lineTo(textProps.posX + textWidth / 2, textProps.posY + 2);
            context.stroke();
          }
        }
        const imageData = canvas.toDataURL("image/png");
        setGeneratedImage(imageData);
        if (isImageFinal) {
          setImageList((prevList) => {
            if (!prevList.includes(imageData)) {
              return [...prevList, imageData];
            }
            return prevList;
          });
        }
      };
    }
  }, [
    selectedImage,
    textProps,
    fontStyle,
    isImageFinal,
    isCapitalized,
    setGeneratedImage,
    setImageList,
  ]);

  const processCertificates = useCallback(() => {
    const count = nameLists.length;

    if (count === 0) {
      return;
    }

    const generateAndDownload = (index: number) => {
      if (index >= count) {
        setImageListModal(true);
        return;
      }

      const name = nameLists[index];
      handleNameChange({
        target: { value: name },
      } as React.ChangeEvent<HTMLInputElement>);

      generateCertificate();

      setTimeout(() => {
        generateAndDownload(index + 1);
      }, 2000);
    };

    generateAndDownload(0);
  }, [nameLists, handleNameChange, generateCertificate, setImageListModal]);

  useEffect(() => {
    if (selectedImage) {
      generateCertificate();
    }
  }, [
    selectedImage,
    textProps.name,
    textProps.fontSize,
    textProps.isBold,
    textProps.isItalic,
    textProps.isUnderline,
    textProps.selectedFont,
    textProps.posX,
    textProps.posY,
    textProps.textColor,
    isCapitalized,
    generateCertificate,
  ]);

  return { processCertificates };
}
