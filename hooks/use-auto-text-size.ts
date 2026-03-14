"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TemplateTextConfig } from "@/types";
import { autoFitText, TextFitResult } from "@/services/text-sizing.service";

export function useAutoTextSize() {
  const [result, setResult] = useState<TextFitResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computeTextSize = useCallback(
    (
      text: string,
      config: TemplateTextConfig,
      canvasWidth: number,
      canvasHeight: number
    ) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d")!;

        const displayName = config.capitalize ? text.toUpperCase() : text;

        const maxFontSize = (config.maxFontSizePercent / 100) * canvasHeight;
        const boundingBoxWidth = (config.boundingBoxWidthPercent / 100) * canvasWidth;
        const boundingBoxHeight = (config.boundingBoxHeightPercent / 100) * canvasHeight;

        const fit = autoFitText(
          ctx,
          displayName,
          config.fontFamily,
          config.fontWeight,
          config.fontStyle,
          maxFontSize,
          config.minFontSizePx,
          boundingBoxWidth,
          boundingBoxHeight
        );

        setResult(fit);
      }, 300);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { textFitResult: result, computeTextSize };
}
