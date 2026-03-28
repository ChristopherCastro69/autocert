"use client";

import { useState, useCallback, useEffect } from "react";
import { Template, Recipient, TemplateTextConfig } from "@/types";
import { useTextProperties } from "@/hooks/use-text-properties";
import { CertificatePreview } from "./certificate-preview";
import { TextControls } from "./text-controls";
import { PositionControls } from "./position-controls";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAPER_SIZES, MIN_TEMPLATE_WIDTH, MIN_TEMPLATE_HEIGHT } from "@/lib/constants";
import type { PaperSize } from "@/lib/constants";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

interface CertificateEditorProps {
  template: Template;
  recipients: Recipient[];
  onConfigChange?: (config: TemplateTextConfig) => void;
}

export function CertificateEditor({
  template,
  recipients,
  onConfigChange,
}: CertificateEditorProps) {
  const {
    config,
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
  } = useTextProperties(template.text_config);

  const [templateRes, setTemplateRes] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setTemplateRes({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = template.template_url;
  }, [template.template_url]);

  // Check if template resolution is too low for selected paper size
  const selectedSize = PAPER_SIZES[config.outputSize ?? "original"];
  const isUpscaling = templateRes && selectedSize.width > 0 &&
    (templateRes.w < selectedSize.width || templateRes.h < selectedSize.height);
  const isLowRes = templateRes &&
    (templateRes.w < MIN_TEMPLATE_WIDTH || templateRes.h < MIN_TEMPLATE_HEIGHT);

  // Notify parent of config changes
  useEffect(() => {
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  const previewNames = recipients.slice(0, 5);
  const [previewIndex, setPreviewIndex] = useState(0);

  const currentName =
    previewNames.length > 0
      ? `${previewNames[previewIndex]?.first_name ?? ""} ${previewNames[previewIndex]?.last_name ?? ""}`.trim()
      : "Sample Name";

  const handlePrevName = useCallback(() => {
    setPreviewIndex((i) => (i > 0 ? i - 1 : previewNames.length - 1));
  }, [previewNames.length]);

  const handleNextName = useCallback(() => {
    setPreviewIndex((i) => (i < previewNames.length - 1 ? i + 1 : 0));
  }, [previewNames.length]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <CertificatePreview
          templateUrl={template.template_url}
          recipientName={currentName}
          textConfig={config}
        />

        {previewNames.length > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handlePrevName}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Preview: {currentName} ({previewIndex + 1}/{previewNames.length})
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleNextName}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-0 lg:self-start">
      <Card className="flex flex-col lg:max-h-[calc(100vh-21rem)]">
        <div className="flex-1 overflow-y-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Text Style</CardTitle>
          </CardHeader>
          <CardContent>
            <TextControls
              config={config}
              setFontFamily={setFontFamily}
              setMaxFontSizePercent={setMaxFontSizePercent}
              setFontWeight={setFontWeight}
              setFontStyle={setFontStyle}
              setTextDecoration={setTextDecoration}
              setTextColor={setTextColor}
              setTextAlign={setTextAlign}
              setCapitalize={setCapitalize}
            />
          </CardContent>

          <div className="border-t mx-6" />

          <CardHeader className="pb-3">
            <CardTitle className="text-base">Position</CardTitle>
          </CardHeader>
          <CardContent>
            <PositionControls
              config={config}
              setPosXPercent={setPosXPercent}
              setPosYPercent={setPosYPercent}
              setBoundingBoxWidthPercent={setBoundingBoxWidthPercent}
              setBoundingBoxHeightPercent={setBoundingBoxHeightPercent}
            />
          </CardContent>

          <div className="border-t mx-6" />

          <CardHeader className="pb-3">
            <CardTitle className="text-base">Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Paper Size</Label>
              <Select
                value={config.outputSize ?? "original"}
                onValueChange={(v) => setOutputSize(v as PaperSize)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAPER_SIZES).map(([key, size]) => (
                    <SelectItem key={key} value={key}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {templateRes && (
              <p className="text-xs text-muted-foreground">
                Template: {templateRes.w}×{templateRes.h}px
              </p>
            )}

            {isUpscaling && (
              <div className="flex gap-2 items-start rounded-md bg-yellow-500/10 border border-yellow-500/20 p-2.5">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Template is smaller than {selectedSize.label} output. This may reduce quality.
                </p>
              </div>
            )}

            {isLowRes && config.outputSize === "original" && (
              <div className="flex gap-2 items-start rounded-md bg-yellow-500/10 border border-yellow-500/20 p-2.5">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Low resolution. For print quality, use at least {MIN_TEMPLATE_WIDTH}×{MIN_TEMPLATE_HEIGHT}px.
                </p>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
      </div>
    </div>
  );
}
