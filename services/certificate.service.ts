import { TemplateTextConfig } from "@/types";
import { autoFitText } from "./text-sizing.service";
import { BATCH_YIELD_INTERVAL, PAPER_SIZES } from "@/lib/constants";

interface ResolvedConfig {
  posX: number;
  posY: number;
  boundingBoxWidth: number;
  boundingBoxHeight: number;
  maxFontSize: number;
  minFontSize: number;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`));

    // Data URLs don't need crossOrigin
    if (!src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.src = src;
  });
}

export function resolveConfig(
  img: HTMLImageElement,
  config: TemplateTextConfig
): ResolvedConfig {
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  return {
    posX: (config.posXPercent / 100) * w,
    posY: (config.posYPercent / 100) * h,
    boundingBoxWidth: (config.boundingBoxWidthPercent / 100) * w,
    boundingBoxHeight: (config.boundingBoxHeightPercent / 100) * h,
    maxFontSize: (config.maxFontSizePercent / 100) * h,
    minFontSize: config.minFontSizePx,
  };
}

export function renderText(
  ctx: CanvasRenderingContext2D,
  name: string,
  resolved: ResolvedConfig,
  config: TemplateTextConfig
): void {
  const displayName = config.capitalize ? name.toUpperCase() : name;

  const fit = autoFitText(
    ctx,
    displayName,
    config.fontFamily,
    config.fontWeight,
    config.fontStyle,
    resolved.maxFontSize,
    resolved.minFontSize,
    resolved.boundingBoxWidth,
    resolved.boundingBoxHeight
  );

  ctx.font = `${config.fontStyle} ${config.fontWeight} ${fit.fontSize}px ${config.fontFamily}`;
  ctx.fillStyle = config.textColor;
  ctx.textAlign = config.textAlign;
  ctx.textBaseline = "top";

  // Calculate x position based on textAlign
  let x: number;
  if (config.textAlign === "center") {
    x = resolved.posX;
  } else if (config.textAlign === "right") {
    x = resolved.posX + resolved.boundingBoxWidth / 2;
  } else {
    x = resolved.posX - resolved.boundingBoxWidth / 2;
  }

  // Center the text block vertically within the bounding box
  const totalTextHeight = fit.lines.length * fit.lineHeight;
  let y = resolved.posY - totalTextHeight / 2;

  for (const line of fit.lines) {
    ctx.fillText(line, x, y);

    // Draw underline if needed
    if (config.textDecoration === "underline") {
      const metrics = ctx.measureText(line);
      const lineWidth = metrics.width;
      let underlineX: number;

      if (config.textAlign === "center") {
        underlineX = x - lineWidth / 2;
      } else if (config.textAlign === "right") {
        underlineX = x - lineWidth;
      } else {
        underlineX = x;
      }

      ctx.save();
      ctx.strokeStyle = config.textColor;
      ctx.lineWidth = Math.max(1, fit.fontSize * 0.05);
      ctx.beginPath();
      ctx.moveTo(underlineX, y + fit.fontSize * 1.1);
      ctx.lineTo(underlineX + lineWidth, y + fit.fontSize * 1.1);
      ctx.stroke();
      ctx.restore();
    }

    y += fit.lineHeight;
  }
}

function getOutputDimensions(
  img: HTMLImageElement,
  config: TemplateTextConfig
): { width: number; height: number } {
  const sizeKey = config.outputSize ?? "original";
  if (sizeKey === "original") {
    return { width: img.naturalWidth, height: img.naturalHeight };
  }
  const paper = PAPER_SIZES[sizeKey];
  return { width: paper.width, height: paper.height };
}

export async function generateSingleCertificate(
  templateSrc: string,
  recipientName: string,
  config: TemplateTextConfig
): Promise<Blob> {
  const img = await loadImage(templateSrc);
  const { width, height } = getOutputDimensions(img, config);

  // Render at native resolution first
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = img.naturalWidth;
  srcCanvas.height = img.naturalHeight;
  const srcCtx = srcCanvas.getContext("2d")!;
  srcCtx.drawImage(img, 0, 0);
  const resolved = resolveConfig(img, config);
  renderText(srcCtx, recipientName, resolved, config);

  // Scale to output size if needed
  const outCanvas = document.createElement("canvas");
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext("2d")!;
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = "high";
  outCtx.drawImage(srcCanvas, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    outCanvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate certificate blob"));
      },
      `image/${config.outputFormat}`,
      config.outputQuality
    );
  });
}

function yieldToUI(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export async function* generateBatch(
  templateSrc: string,
  config: TemplateTextConfig,
  recipients: { firstName: string; lastName: string }[],
  onProgress?: (current: number, total: number) => void
): AsyncGenerator<{ name: string; blob: Blob }> {
  const img = await loadImage(templateSrc);
  const { width, height } = getOutputDimensions(img, config);
  const needsScale = width !== img.naturalWidth || height !== img.naturalHeight;
  const total = recipients.length;

  for (let i = 0; i < total; i++) {
    const { firstName, lastName } = recipients[i];
    const name = `${firstName} ${lastName}`.trim();

    // Render at native resolution
    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = img.naturalWidth;
    srcCanvas.height = img.naturalHeight;
    const srcCtx = srcCanvas.getContext("2d")!;
    srcCtx.drawImage(img, 0, 0);
    const resolved = resolveConfig(img, config);
    renderText(srcCtx, name, resolved, config);

    // Scale if needed
    const outCanvas = needsScale ? document.createElement("canvas") : srcCanvas;
    if (needsScale) {
      outCanvas.width = width;
      outCanvas.height = height;
      const outCtx = outCanvas.getContext("2d")!;
      outCtx.imageSmoothingEnabled = true;
      outCtx.imageSmoothingQuality = "high";
      outCtx.drawImage(srcCanvas, 0, 0, width, height);
    }

    const blob: Blob = await new Promise((resolve, reject) => {
      outCanvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error(`Failed to generate certificate for ${name}`));
        },
        `image/${config.outputFormat}`,
        config.outputQuality
      );
    });

    onProgress?.(i + 1, total);
    yield { name, blob };

    // Yield to UI every BATCH_YIELD_INTERVAL certs
    if ((i + 1) % BATCH_YIELD_INTERVAL === 0) {
      await yieldToUI();
    }
  }
}
