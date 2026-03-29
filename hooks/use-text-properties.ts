"use client";

import { useState, useCallback } from "react";
import { TemplateTextConfig } from "@/types";
import { DEFAULT_TEXT_CONFIG } from "@/lib/constants";

export function useTextProperties(initial?: Partial<TemplateTextConfig>) {
  const [config, setConfig] = useState<TemplateTextConfig>({
    ...DEFAULT_TEXT_CONFIG,
    ...initial,
  });

  const setFontFamily = useCallback((fontFamily: string) => {
    setConfig((prev) => ({ ...prev, fontFamily }));
  }, []);

  const setMaxFontSizePercent = useCallback((maxFontSizePercent: number) => {
    setConfig((prev) => ({ ...prev, maxFontSizePercent }));
  }, []);

  const setFontWeight = useCallback(
    (fontWeight: TemplateTextConfig["fontWeight"]) => {
      setConfig((prev) => ({ ...prev, fontWeight }));
    },
    []
  );

  const setFontStyle = useCallback(
    (fontStyle: TemplateTextConfig["fontStyle"]) => {
      setConfig((prev) => ({ ...prev, fontStyle }));
    },
    []
  );

  const setTextDecoration = useCallback(
    (textDecoration: TemplateTextConfig["textDecoration"]) => {
      setConfig((prev) => ({ ...prev, textDecoration }));
    },
    []
  );

  const setTextColor = useCallback((textColor: string) => {
    setConfig((prev) => ({ ...prev, textColor }));
  }, []);

  const setTextAlign = useCallback(
    (textAlign: TemplateTextConfig["textAlign"]) => {
      setConfig((prev) => ({ ...prev, textAlign }));
    },
    []
  );

  const setCapitalize = useCallback((capitalize: boolean) => {
    setConfig((prev) => ({ ...prev, capitalize }));
  }, []);

  const setPosXPercent = useCallback((posXPercent: number) => {
    setConfig((prev) => ({ ...prev, posXPercent }));
  }, []);

  const setPosYPercent = useCallback((posYPercent: number) => {
    setConfig((prev) => ({ ...prev, posYPercent }));
  }, []);

  const setBoundingBoxWidthPercent = useCallback(
    (boundingBoxWidthPercent: number) => {
      setConfig((prev) => ({ ...prev, boundingBoxWidthPercent }));
    },
    []
  );

  const setBoundingBoxHeightPercent = useCallback(
    (boundingBoxHeightPercent: number) => {
      setConfig((prev) => ({ ...prev, boundingBoxHeightPercent }));
    },
    []
  );

  const setOutputSize = useCallback(
    (outputSize: TemplateTextConfig["outputSize"]) => {
      setConfig((prev) => ({ ...prev, outputSize }));
    },
    []
  );

  return {
    config,
    setConfig,
    setFontFamily,
    setMaxFontSizePercent,
    setFontWeight,
    setFontStyle,
    setTextDecoration,
    setTextColor,
    setTextAlign,
    setCapitalize,
    setPosXPercent,
    setPosYPercent,
    setBoundingBoxWidthPercent,
    setBoundingBoxHeightPercent,
    setOutputSize,
  };
}
