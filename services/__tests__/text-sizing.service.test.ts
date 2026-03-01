import { describe, it, expect, vi } from "vitest";
import { autoFitText } from "../text-sizing.service";

function createMockCtx(): CanvasRenderingContext2D {
  const ctx = {
    font: "",
    measureText: vi.fn((text: string) => {
      // Extract fontSize from the font string (e.g. "normal normal 24px Arial")
      const match = ctx.font.match(/(\d+)px/);
      const fontSize = match ? parseInt(match[1]) : 16;
      return { width: text.length * fontSize * 0.6 };
    }),
  } as unknown as CanvasRenderingContext2D;
  return ctx;
}

const FONT_FAMILY = "Arial";
const FONT_WEIGHT = "normal";
const FONT_STYLE = "normal";

describe("autoFitText", () => {
  it("returns correct font size for short text that fits easily", () => {
    const ctx = createMockCtx();
    const result = autoFitText(
      ctx,
      "Hello",
      FONT_FAMILY,
      FONT_WEIGHT,
      FONT_STYLE,
      48,  // maxFontSize
      10,  // minFontSize
      500, // boundingBoxWidth
      100  // boundingBoxHeight
    );

    expect(result.fontSize).toBeGreaterThan(10);
    expect(result.lines).toEqual(["Hello"]);
    expect(result.lines).toHaveLength(1);
  });

  it("returns a smaller font size for longer text", () => {
    const ctx = createMockCtx();
    const shortResult = autoFitText(
      ctx,
      "Hi",
      FONT_FAMILY,
      FONT_WEIGHT,
      FONT_STYLE,
      48,
      10,
      200,
      100
    );

    const longResult = autoFitText(
      ctx,
      "This is a much longer piece of text",
      FONT_FAMILY,
      FONT_WEIGHT,
      FONT_STYLE,
      48,
      10,
      200,
      100
    );

    expect(shortResult.fontSize).toBeGreaterThanOrEqual(longResult.fontSize);
  });

  it("splits into multiple lines when text is too long for single line", () => {
    const ctx = createMockCtx();
    const result = autoFitText(
      ctx,
      "This is an extremely long name that cannot fit on one line",
      FONT_FAMILY,
      FONT_WEIGHT,
      FONT_STYLE,
      48,
      10,
      150, // narrow bounding box
      100
    );

    expect(result.lines.length).toBe(2);
    expect(result.lines.join(" ")).toBe(
      "This is an extremely long name that cannot fit on one line"
    );
  });

  it("does not exceed max font size", () => {
    const ctx = createMockCtx();
    const maxFontSize = 30;
    const result = autoFitText(
      ctx,
      "A",
      FONT_FAMILY,
      FONT_WEIGHT,
      FONT_STYLE,
      maxFontSize,
      10,
      1000, // very wide box
      1000  // very tall box
    );

    expect(result.fontSize).toBeLessThanOrEqual(maxFontSize);
  });

  it("does not go below min font size for single word text", () => {
    const ctx = createMockCtx();
    const minFontSize = 12;
    // Single word with no spaces — cannot split, falls back to minFontSize
    const result = autoFitText(
      ctx,
      "Supercalifragilisticexpialidocious",
      FONT_FAMILY,
      FONT_WEIGHT,
      FONT_STYLE,
      48,
      minFontSize,
      50, // very narrow box
      100
    );

    expect(result.fontSize).toBe(minFontSize);
    expect(result.lines).toHaveLength(1);
  });

  it("sets lineHeight to 1.3x the font size", () => {
    const ctx = createMockCtx();
    const result = autoFitText(
      ctx,
      "Test",
      FONT_FAMILY,
      FONT_WEIGHT,
      FONT_STYLE,
      48,
      10,
      500,
      100
    );

    expect(result.lineHeight).toBeCloseTo(result.fontSize * 1.3);
  });

  it("respects bounding box height constraint", () => {
    const ctx = createMockCtx();
    const boundingBoxHeight = 30;
    const result = autoFitText(
      ctx,
      "Test",
      FONT_FAMILY,
      FONT_WEIGHT,
      FONT_STYLE,
      100, // large max
      10,
      500,
      boundingBoxHeight
    );

    // Font size should be clamped to floor(height * 0.85)
    expect(result.fontSize).toBeLessThanOrEqual(
      Math.floor(boundingBoxHeight * 0.85)
    );
  });
});
