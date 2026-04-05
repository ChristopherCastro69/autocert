"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGuest } from "@/components/context/guest-context";
import { CertificateEditor } from "@/components/certificate/certificate-editor";
import { BatchProgress } from "@/components/certificate/batch-progress";
import { useGuestBatchGeneration } from "@/hooks/use-guest-batch-generation";
import { useGuestZipDownload } from "@/hooks/use-guest-zip-download";
import { SaveWorkCard } from "@/components/guest/save-work-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Template, Recipient, TemplateTextConfig } from "@/types";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  Send,
} from "lucide-react";

export default function GuestGeneratePage() {
  const router = useRouter();
  const {
    templateObjectUrl,
    templateName,
    textConfig,
    setTextConfig,
    recipients,
    generatedCerts,
    setGeneratedCerts,
  } = useGuest();

  const [resultsOpen, setResultsOpen] = useState(false);

  const { progress, isGenerating, results, error, generate, cancel } =
    useGuestBatchGeneration();
  const { handleZipDownload, isDownloading } = useGuestZipDownload();

  // Build pseudo Template for CertificateEditor
  const pseudoTemplate: Template | null = templateObjectUrl
    ? {
        id: "guest",
        event_id: "guest",
        name: templateName,
        type: "custom",
        template_url: templateObjectUrl,
        text_config: textConfig,
        created_at: "",
        updated_at: "",
      }
    : null;

  // Build pseudo Recipients for CertificateEditor
  const pseudoRecipients: Recipient[] = recipients.map((r, i) => ({
    id: `guest-${i}`,
    event_id: "guest",
    first_name: r.firstName,
    last_name: r.lastName,
    email: r.email ?? null,
    metadata: {},
    created_at: "",
  }));

  const [currentConfig, setCurrentConfig] = useState<TemplateTextConfig | null>(null);

  const handleConfigChange = useCallback((config: TemplateTextConfig) => {
    setCurrentConfig(config);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!templateObjectUrl || recipients.length === 0) return;

    const config = currentConfig ?? textConfig;
    // Save config to context
    setTextConfig(config);

    await generate(templateObjectUrl, config, recipients);
  }, [templateObjectUrl, recipients, currentConfig, textConfig, setTextConfig, generate]);

  // Sync batch results to context when generation completes
  const displayResults = results.length > 0 ? results : generatedCerts;

  useEffect(() => {
    if (results.length > 0) {
      setGeneratedCerts(results);
    }
  }, [results, setGeneratedCerts]);

  // Stable object URLs for preview dialog
  const previewUrls = useMemo(() => {
    return displayResults.map((r) => ({
      name: r.name,
      url: URL.createObjectURL(r.blob),
    }));
  }, [displayResults]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      previewUrls.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previewUrls]);

  // Memory estimate
  const estimatedMB = recipients.length > 0
    ? Math.round(recipients.length * 0.5)
    : 0;

  if (!templateObjectUrl) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="mt-12">
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Upload a template first</p>
            <Button variant="outline" onClick={() => router.push("/guest/template")}>
              Go to Template
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recipients.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="mt-12">
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Add recipients first</p>
            <Button variant="outline" onClick={() => router.push("/guest/recipients")}>
              Go to Recipients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generate Certificates</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {recipients.length} recipient{recipients.length !== 1 ? "s" : ""}
          {estimatedMB > 50 && (
            <span className="ml-2 text-yellow-600">
              (estimated ~{estimatedMB}MB of browser memory)
            </span>
          )}
        </p>
      </div>

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

      {displayResults.length > 0 && !isGenerating && (
        <>
          <div className="flex items-center gap-4 rounded-lg border bg-card px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>
                {displayResults.length} certificate{displayResults.length !== 1 ? "s" : ""} generated
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResultsOpen(true)}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isDownloading}
                onClick={() => handleZipDownload(displayResults)}
              >
                {isDownloading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                Download ZIP
              </Button>
              <Button
                size="sm"
                onClick={() => router.push("/guest/distribute")}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Send via Email
              </Button>
            </div>
          </div>

          <Dialog open={resultsOpen} onOpenChange={setResultsOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  Generated Certificates ({displayResults.length})
                </DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto flex-1 -mx-6 px-6 pb-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {previewUrls.map((r, i) => (
                    <div
                      key={i}
                      className="group rounded-lg border bg-card overflow-hidden"
                    >
                      <div className="relative aspect-[1.414] bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.url}
                          alt={r.name}
                          className="absolute inset-0 h-full w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="px-3 py-2">
                        <span className="text-xs font-medium truncate block">
                          {r.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {displayResults.length > 0 && !isGenerating && <SaveWorkCard />}

      {pseudoTemplate && (
        <CertificateEditor
          template={pseudoTemplate}
          recipients={pseudoRecipients}
          onConfigChange={handleConfigChange}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
}
