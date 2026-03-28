"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { TemplateTextConfig } from "@/types";
import {
  loadImage,
  resolveConfig,
  renderText,
} from "@/services/certificate.service";
import { PAPER_SIZES } from "@/lib/constants";

interface CertificatePreviewProps {
  templateUrl: string;
  recipientName: string;
  textConfig: TemplateTextConfig;
}

export function CertificatePreview({
  templateUrl,
  recipientName,
  textConfig,
}: CertificatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !templateUrl) return;

    try {
      const img = await loadImage(templateUrl);

      // Determine output dimensions
      const sizeKey = textConfig.outputSize ?? "original";
      const paper = PAPER_SIZES[sizeKey];
      const outW = sizeKey === "original" ? img.naturalWidth : paper.width;
      const outH = sizeKey === "original" ? img.naturalHeight : paper.height;

      // Render text at native resolution
      const srcCanvas = document.createElement("canvas");
      srcCanvas.width = img.naturalWidth;
      srcCanvas.height = img.naturalHeight;
      const srcCtx = srcCanvas.getContext("2d")!;
      srcCtx.drawImage(img, 0, 0);

      if (recipientName) {
        const resolved = resolveConfig(img, textConfig);
        renderText(srcCtx, recipientName, resolved, textConfig);
      }

      // Scale to output size for preview
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(srcCanvas, 0, 0, outW, outH);

      setDimensions({ width: outW, height: outH });
    } catch {
      // Template may still be loading
    }
  }, [templateUrl, recipientName, textConfig]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(render, 150);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [render]);

  const aspectRatio =
    dimensions.width && dimensions.height
      ? dimensions.width / dimensions.height
      : 16 / 9;

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="relative w-full overflow-hidden rounded-lg border bg-muted"
        style={{ aspectRatio }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-contain"
        />
        {!templateUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            No template selected
          </div>
        )}
      </div>
    </div>
  );
}
