"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGuest } from "@/components/context/guest-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SUPPORTED_IMAGE_TYPES,
  MAX_TEMPLATE_SIZE_MB,
  MIN_TEMPLATE_WIDTH,
  MIN_TEMPLATE_HEIGHT,
} from "@/lib/constants";
import { Upload, AlertTriangle, CheckCircle2, ImageIcon } from "lucide-react";

export default function GuestTemplatePage() {
  const router = useRouter();
  const { templateObjectUrl, templateName, setTemplate, clearTemplate } = useGuest();

  const [error, setError] = useState<string | null>(null);
  const [resWarning, setResWarning] = useState<string | null>(null);
  const [resolution, setResolution] = useState<{ w: number; h: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      setError("Please select a PNG or JPEG image.");
      return;
    }
    if (file.size > MAX_TEMPLATE_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_TEMPLATE_SIZE_MB}MB.`);
      return;
    }

    setError(null);
    setResWarning(null);
    setResolution(null);

    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setResolution({ w, h });

      if (w < MIN_TEMPLATE_WIDTH || h < MIN_TEMPLATE_HEIGHT) {
        setResWarning(
          `Image is ${w}×${h}px. For print-quality certificates, we recommend at least ${MIN_TEMPLATE_WIDTH}×${MIN_TEMPLATE_HEIGHT}px.`
        );
      }

      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);

    setTemplate(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleContinue = () => {
    router.push("/guest/recipients");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Certificate Template</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your certificate template image. It stays in your browser — nothing is uploaded to any server.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Template Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
              ${templateObjectUrl ? "border-primary/30" : ""}
            `}
          >
            {templateObjectUrl ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={templateObjectUrl}
                  alt="Template preview"
                  className="max-h-48 mx-auto rounded border"
                />
                <p className="text-sm font-medium">{templateName}</p>
                {resolution && (
                  <p className="text-xs text-muted-foreground">
                    {resolution.w}×{resolution.h}px
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Click or drop to replace
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    Drop your certificate template here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG or JPEG, up to {MAX_TEMPLATE_SIZE_MB}MB
                  </p>
                </div>
                <Button variant="outline" size="sm" type="button">
                  <Upload className="mr-2 h-3.5 w-3.5" />
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          <Input
            ref={fileRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />

          {resWarning && (
            <div className="flex gap-2 items-start rounded-md bg-yellow-500/10 border border-yellow-500/20 p-3">
              <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-500">Low resolution</p>
                <p className="text-xs text-muted-foreground">{resWarning}</p>
              </div>
            </div>
          )}

          {resolution && !resWarning && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              {resolution.w}×{resolution.h}px — good resolution
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {templateObjectUrl && (
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={clearTemplate}>
            Remove template
          </Button>
          <Button onClick={handleContinue}>
            Continue to Recipients
          </Button>
        </div>
      )}
    </div>
  );
}
