"use client";

import { useCallback } from "react";
import { TemplateTextConfig } from "@/types";
import {
  loadImage,
  resolveConfig,
  renderText,
} from "@/services/certificate.service";

export function useCertificateProcessor() {
  const generatePreview = useCallback(
    async (
      templateUrl: string,
      name: string,
      config: TemplateTextConfig
    ): Promise<string> => {
      const img = await loadImage(templateUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const resolved = resolveConfig(img, config);
      renderText(ctx, name, resolved, config);

      return canvas.toDataURL(`image/${config.outputFormat}`, config.outputQuality);
    },
    []
  );

  return { generatePreview };
}
