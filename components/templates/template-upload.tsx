"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { uploadFile, getPublicUrl } from "@/services/storage.service";
import { DEFAULT_TEXT_CONFIG, CERTIFICATE_TYPES, SUPPORTED_IMAGE_TYPES, MAX_TEMPLATE_SIZE_MB } from "@/lib/constants";
import type { TemplateType } from "@/types";

interface TemplateUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onUploaded: () => void;
}

export function TemplateUpload({ open, onOpenChange, eventId, onUploaded }: TemplateUploadProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<TemplateType>("participant");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setName("");
    setType("participant");
    setFile(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!SUPPORTED_IMAGE_TYPES.includes(selected.type)) {
      setError("Please select a PNG or JPEG image.");
      return;
    }
    if (selected.size > MAX_TEMPLATE_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_TEMPLATE_SIZE_MB}MB.`);
      return;
    }

    setError(null);
    setFile(selected);
    if (!name) {
      setName(selected.name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleSubmit = async () => {
    if (!file || !name.trim()) return;

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "png";
      const storagePath = `certificates/templates/${eventId}/${Date.now()}.${ext}`;

      await uploadFile(supabase, "autocert", storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

      const publicUrl = getPublicUrl(supabase, storagePath);

      const { error: insertError } = await supabase.from("templates").insert({
        event_id: eventId,
        name: name.trim(),
        type,
        template_url: publicUrl,
        text_config: DEFAULT_TEXT_CONFIG,
      });

      if (insertError) throw new Error(insertError.message);

      reset();
      onOpenChange(false);
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Certificate of Participation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as TemplateType)}>
              <SelectTrigger id="template-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CERTIFICATE_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-file">Template Image</Label>
            <Input
              id="template-file"
              ref={fileRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={uploading || !file || !name.trim()}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
