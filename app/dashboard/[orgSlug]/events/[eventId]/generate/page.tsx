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
import { useZipDownload } from "@/hooks/use-zip-download";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Play,
  FileImage,
  Users,
  CheckCircle2,
  Download,
  Eye,
  ExternalLink,
} from "lucide-react";

export default function GeneratePage() {
  const params = useParams<{ orgSlug: string; eventId: string }>();
  const eventId = params.eventId;

  const [templates, setTemplates] = useState<Template[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [resultsOpen, setResultsOpen] = useState(false);

  const { progress, isGenerating, results, error, generate, cancel } =
    useBatchGeneration();
  const { handleZipDownload, isDownloading } = useZipDownload();

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
          <h1 className="text-lg font-semibold">Generate Certificates</h1>
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
        <>
          <div className="flex items-center gap-4 rounded-lg border bg-card px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>
                {results.length} certificate{results.length !== 1 ? "s" : ""}{" "}
                generated
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResultsOpen(true)}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                View Results
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isDownloading}
                onClick={() =>
                  handleZipDownload(
                    results.map((r) => ({
                      name: r.recipientName,
                      url: r.imageUrl,
                    }))
                  )
                }
              >
                {isDownloading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                Download ZIP
              </Button>
            </div>
          </div>

          <Dialog open={resultsOpen} onOpenChange={setResultsOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  Generated Certificates ({results.length})
                </DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto flex-1 -mx-6 px-6 pb-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {results.map((r) => (
                    <div
                      key={r.recipientId}
                      className="group rounded-lg border bg-card overflow-hidden"
                    >
                      <div className="relative aspect-[1.414] bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.imageUrl}
                          alt={r.recipientName}
                          className="absolute inset-0 h-full w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-xs font-medium truncate">
                          {r.recipientName}
                        </span>
                        <a
                          href={r.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
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
