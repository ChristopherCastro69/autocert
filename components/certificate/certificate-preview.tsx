"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { TemplateTextConfig } from "@/types";
import {
  loadImage,
  resolveConfig,
  renderText,
} from "@/services/certificate.service";

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
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      if (recipientName) {
        const resolved = resolveConfig(img, textConfig);
        renderText(ctx, recipientName, resolved, textConfig);
      }
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
