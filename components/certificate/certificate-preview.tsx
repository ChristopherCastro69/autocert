"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { TemplateTextConfig } from "@/types";
import {
  loadImage,
  resolveConfig,
  renderText,
} from "@/services/certificate.service";
import { PAPER_SIZES } from "@/lib/constants";
import { AlertTriangle } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !templateUrl) return;

    setError(null);

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
      const srcCtx = srcCanvas.getContext("2d");
      if (!srcCtx) {
        setError("Canvas too large for this browser");
        return;
      }
      srcCtx.drawImage(img, 0, 0);

      if (recipientName) {
        const resolved = resolveConfig(img, textConfig);
        renderText(srcCtx, recipientName, resolved, textConfig);
      }

      // Scale to output size for preview
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Canvas too large for this browser");
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(srcCanvas, 0, 0, outW, outH);

      setDimensions({ width: outW, height: outH });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load template";
      setError(msg);
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
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
