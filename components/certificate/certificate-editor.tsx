"use client";

import { useState, useCallback } from "react";
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
import { createClient } from "@/lib/supabase/client";
import * as templateRepo from "@/repositories/template.repository";
import { Save, ChevronLeft, ChevronRight } from "lucide-react";

interface CertificateEditorProps {
  template: Template;
  recipients: Recipient[];
  onConfigSaved?: (config: TemplateTextConfig) => void;
}

export function CertificateEditor({
  template,
  recipients,
  onConfigSaved,
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
  } = useTextProperties(template.text_config);

  const previewNames = recipients.slice(0, 5);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [saving, setSaving] = useState(false);

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

  const handleSaveConfig = useCallback(async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      await templateRepo.updateTextConfig(supabase, template.id, config);
      onConfigSaved?.(config);
    } finally {
      setSaving(false);
    }
  }, [template.id, config, onConfigSaved]);

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

      <div className="space-y-4">
        <Card>
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
        </Card>

        <Card>
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
        </Card>

        <Button
          className="w-full"
          onClick={handleSaveConfig}
          disabled={saving}
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Config"}
        </Button>
      </div>
    </div>
  );
}
