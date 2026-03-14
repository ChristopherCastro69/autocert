# Certificate Engine

The certificate engine renders recipient names onto template images using the HTML Canvas API. All rendering happens client-side in the browser.

## How It Works

1. Load the template image onto a Canvas element at its native resolution
2. Convert percentage-based text configuration to pixel values
3. Auto-fit the recipient's name within a bounding box
4. Render the text onto the canvas
5. Export as PNG or JPEG blob

Core code: `services/certificate.service.ts` and `services/text-sizing.service.ts`

## TemplateTextConfig

All positioning and sizing values are stored as percentages of the template image dimensions. This makes configurations resolution-independent -- the same config works on a 1920x1080 template and a 3840x2160 template.

```typescript
interface TemplateTextConfig {
  // Position (percentage of image width/height)
  posXPercent: number;       // X center of text bounding box (0-100)
  posYPercent: number;       // Y center of text bounding box (0-100)

  // Bounding box (percentage of image width/height)
  boundingBoxWidthPercent: number;   // Width of text area (0-100)
  boundingBoxHeightPercent: number;  // Height of text area (0-100)

  // Font sizing
  fontFamily: string;              // e.g. "Arial", "Poppins", "Pacifico"
  maxFontSizePercent: number;      // Max font size as % of image height
  minFontSizePx: number;           // Absolute minimum font size in pixels

  // Styling
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline";
  textColor: string;               // Hex color
  textAlign: "center" | "left" | "right";
  capitalize: boolean;             // Force uppercase

  // Output
  outputFormat: "png" | "jpeg";
  outputQuality: number;           // 0-1, for JPEG compression
}
```

### Resolution Flow

The `resolveConfig()` function converts percentages to pixels:

```
posX           = (posXPercent / 100) * imageWidth
posY           = (posYPercent / 100) * imageHeight
boundingBoxW   = (boundingBoxWidthPercent / 100) * imageWidth
boundingBoxH   = (boundingBoxHeightPercent / 100) * imageHeight
maxFontSize    = (maxFontSizePercent / 100) * imageHeight
minFontSize    = minFontSizePx  (already in pixels)
```

## Auto-Fit Text Sizing Algorithm

The `autoFitText()` function in `text-sizing.service.ts` finds the largest font size that fits within the bounding box. It uses a three-pass approach:

### Pass 1: Binary Search (Single Line)

Binary search between `minFontSize` and `maxFontSize` for the largest font size where the text width fits within `boundingBoxWidth`.

```
lo = minFontSize, hi = maxFontSize
while lo <= hi:
  mid = floor((lo + hi) / 2)
  if measureText(text, mid).width <= boundingBoxWidth:
    bestSingle = mid
    lo = mid + 1
  else:
    hi = mid - 1
```

### Pass 2: Vertical Clamp

The single-line result is clamped to 85% of the bounding box height:

```
fontSize = min(bestSingle, floor(boundingBoxHeight * 0.85))
```

If the text still fits on one line at this size, return it.

### Pass 3: Multi-Line Fallback

If the text overflows horizontally at the clamped size:

1. Find the space nearest to the midpoint of the text
2. Split into two lines at that space
3. Binary search again on the wider line, constrained by both width and total height (2 lines * lineHeight)

If no space exists to split on, return the text at `minFontSize` on a single line.

Line height is `1.3 * fontSize` throughout.

### Result

```typescript
interface TextFitResult {
  fontSize: number;
  lines: string[];       // 1 or 2 lines
  lineHeight: number;    // fontSize * 1.3
}
```

## Text Rendering

The `renderText()` function in `certificate.service.ts`:

1. Applies the computed font to the Canvas 2D context
2. Calculates X position based on `textAlign` (center/left/right relative to bounding box)
3. Centers the text block vertically within the bounding box
4. Draws each line with `fillText()`
5. Optionally draws underlines by measuring text width and stroking a line at `fontSize * 1.1` below the baseline

## Supported Formats

- **Input templates**: Any image format the browser can load (PNG, JPEG, WebP, etc.)
- **Output**: PNG or JPEG with configurable quality (0-1)
- **Template size**: Any resolution. The percentage-based config scales automatically.
- **Max upload size**: 10 MB per template image

## Batch Generation

The `generateBatch()` function is an async generator that yields one certificate at a time:

```typescript
async function* generateBatch(
  templateSrc: string,
  config: TemplateTextConfig,
  recipients: { firstName: string; lastName: string }[],
  onProgress?: (current: number, total: number) => void
): AsyncGenerator<{ name: string; blob: Blob }>
```

### Flow

1. Load the template image once (shared across all certificates)
2. For each recipient:
   a. Create a new Canvas at the template's native resolution
   b. Draw the template image
   c. Resolve config and render text
   d. Convert canvas to Blob
   e. Call `onProgress` callback
   f. `yield` the result `{ name, blob }`
3. Every 10 certificates (`BATCH_YIELD_INTERVAL`), yield to the UI thread via `requestAnimationFrame` to prevent freezing

### Hook: useBatchGeneration

The `useBatchGeneration` hook orchestrates the full flow:

1. Iterates over the async generator
2. Uploads each blob to Supabase Storage
3. Tracks progress state `{ current, total }`
4. Supports cancellation via a ref
5. After all certificates are generated, batch-inserts records into `generated_certificates`
6. Exposes `{ progress, isGenerating, results, error, generate, cancel }`

### Previous Approach

The old implementation used `setTimeout` hacks to yield to the UI between renders. The current implementation uses:
- An `AsyncGenerator` pattern for streaming results
- `requestAnimationFrame` for controlled UI yielding
- A single image load shared across the batch (instead of reloading per certificate)

## Preview

The `useCertificateProcessor` hook generates a single preview by rendering one certificate and returning a data URL via `canvas.toDataURL()`. The `useAutoTextSize` hook provides debounced (300ms) text sizing computation for the live editor preview.
