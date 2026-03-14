export interface TextFitResult {
  fontSize: number;
  lines: string[];
  lineHeight: number;
}

function setFont(
  ctx: CanvasRenderingContext2D,
  fontFamily: string,
  fontWeight: string,
  fontStyle: string,
  fontSize: number
): void {
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
}

function measureWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  fontWeight: string,
  fontStyle: string,
  fontSize: number
): number {
  setFont(ctx, fontFamily, fontWeight, fontStyle, fontSize);
  return ctx.measureText(text).width;
}

export function autoFitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  fontWeight: string,
  fontStyle: string,
  maxFontSize: number,
  minFontSize: number,
  boundingBoxWidth: number,
  boundingBoxHeight: number
): TextFitResult {
  // Pass 1: Binary search for largest single-line font size
  let lo = minFontSize;
  let hi = maxFontSize;
  let bestSingle = minFontSize;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const width = measureWidth(ctx, text, fontFamily, fontWeight, fontStyle, mid);
    if (width <= boundingBoxWidth) {
      bestSingle = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  // Pass 2: Clamp to vertical fit
  const maxVertical = Math.floor(boundingBoxHeight * 0.85);
  let fontSize = Math.min(bestSingle, maxVertical);

  // Check if single line fits at this font size
  const singleLineWidth = measureWidth(ctx, text, fontFamily, fontWeight, fontStyle, fontSize);
  if (singleLineWidth <= boundingBoxWidth) {
    return {
      fontSize,
      lines: [text],
      lineHeight: fontSize * 1.3,
    };
  }

  // Pass 3: Multi-line — split at space nearest to midpoint
  const midpoint = Math.floor(text.length / 2);
  let splitIndex = -1;
  let minDist = Infinity;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === " ") {
      const dist = Math.abs(i - midpoint);
      if (dist < minDist) {
        minDist = dist;
        splitIndex = i;
      }
    }
  }

  if (splitIndex === -1) {
    // No space to split on — return single line at minFontSize
    return {
      fontSize: minFontSize,
      lines: [text],
      lineHeight: minFontSize * 1.3,
    };
  }

  const line1 = text.slice(0, splitIndex);
  const line2 = text.slice(splitIndex + 1);
  const lines = [line1, line2];
  const widerLine = line1.length >= line2.length ? line1 : line2;

  // Binary search for best font size for the wider line
  lo = minFontSize;
  hi = maxFontSize;
  let bestMulti = minFontSize;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const width = measureWidth(ctx, widerLine, fontFamily, fontWeight, fontStyle, mid);
    const lineHeight = mid * 1.3;
    const totalHeight = lines.length * lineHeight;

    if (width <= boundingBoxWidth && totalHeight <= boundingBoxHeight) {
      bestMulti = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return {
    fontSize: bestMulti,
    lines,
    lineHeight: bestMulti * 1.3,
  };
}
