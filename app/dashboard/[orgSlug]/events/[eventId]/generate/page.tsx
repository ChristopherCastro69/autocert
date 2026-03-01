"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Template, Recipient } from "@/types";
import * as templateRepo from "@/repositories/template.repository";
import * as recipientRepo from "@/repositories/recipient.repository";
import { CertificateEditor } from "@/components/certificate/certificate-editor";
import { BatchProgress } from "@/components/certificate/batch-progress";
import { useBatchGeneration } from "@/hooks/use-batch-generation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Play, FileImage, Users, CheckCircle2 } from "lucide-react";

export default function GeneratePage() {
  const params = useParams<{ orgSlug: string; eventId: string }>();
  const eventId = params.eventId;

  const [templates, setTemplates] = useState<Template[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  const { progress, isGenerating, results, error, generate, cancel } =
    useBatchGeneration();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [tpls, rcpts] = await Promise.all([
        templateRepo.getByEventId(supabase, eventId),
        recipientRepo.getByEventId(supabase, eventId),
      ]);
      setTemplates(tpls);
      setRecipients(rcpts);
      if (tpls.length > 0) setSelectedTemplate(tpls[0]);
      setLoading(false);
    };
    load();
  }, [eventId]);

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      const tpl = templates.find((t) => t.id === templateId) ?? null;
      setSelectedTemplate(tpl);
    },
    [templates]
  );

  const handleGenerate = useCallback(async () => {
    if (!selectedTemplate || recipients.length === 0) return;
    const folderName = selectedTemplate.name.replace(/[^a-zA-Z0-9_-]/g, "_");
    await generate(
      selectedTemplate.template_url,
      selectedTemplate.text_config,
      recipients,
      selectedTemplate.id,
      folderName
    );
  }, [selectedTemplate, recipients, generate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="mx-auto max-w-md mt-12">
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <FileImage className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Upload a template first</p>
        </CardContent>
      </Card>
    );
  }

  if (recipients.length === 0) {
    return (
      <Card className="mx-auto max-w-md mt-12">
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <Users className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Add recipients first</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Generate Certificates</h1>
          <p className="text-sm text-muted-foreground">
            {recipients.length} recipient{recipients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedTemplate}
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Generate All
        </Button>
      </div>

      {templates.length > 1 && (
        <div className="max-w-xs">
          <Label className="text-xs">Template</Label>
          <Select
            value={selectedTemplate?.id ?? ""}
            onValueChange={handleTemplateChange}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((tpl) => (
                <SelectItem key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isGenerating && (
        <BatchProgress
          current={progress.current}
          total={progress.total}
          onCancel={cancel}
        />
      )}

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {results.length > 0 && !isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Generation Complete
            </CardTitle>
            <CardDescription>
              {results.length} certificate{results.length !== 1 ? "s" : ""}{" "}
              generated successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto">
              <ul className="space-y-1 text-sm">
                {results.map((r) => (
                  <li
                    key={r.recipientId}
                    className="flex items-center justify-between py-1"
                  >
                    <span>{r.recipientName}</span>
                    <a
                      href={r.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTemplate && (
        <CertificateEditor
          template={selectedTemplate}
          recipients={recipients}
          onConfigSaved={(config) => {
            setSelectedTemplate((prev) =>
              prev ? { ...prev, text_config: config } : prev
            );
          }}
        />
      )}
    </div>
  );
}
