"use client";

import { useState, useCallback, useRef } from "react";
import { TemplateTextConfig, Recipient, CreateGeneratedCertificateInput } from "@/types";
import { generateBatch } from "@/services/certificate.service";
import { uploadFile, getPublicUrl } from "@/services/storage.service";
import * as generatedCertRepo from "@/repositories/generated-certificate.repository";
import { createClient } from "@/lib/supabase/client";

interface BatchProgress {
  current: number;
  total: number;
}

interface BatchResult {
  recipientId: string;
  recipientName: string;
  imageUrl: string;
}

export function useBatchGeneration() {
  const [progress, setProgress] = useState<BatchProgress>({ current: 0, total: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  const generate = useCallback(
    async (
      templateUrl: string,
      config: TemplateTextConfig,
      recipients: Recipient[],
      templateId: string,
      storageFolderName: string
    ) => {
      setIsGenerating(true);
      setError(null);
      setResults([]);
      cancelledRef.current = false;

      const total = recipients.length;
      setProgress({ current: 0, total });

      const supabase = createClient();
      const batchResults: BatchResult[] = [];
      const dbInputs: CreateGeneratedCertificateInput[] = [];

      try {
        const recipientInputs = recipients.map((r) => ({
          firstName: r.first_name,
          lastName: r.last_name,
        }));

        const generator = generateBatch(
          templateUrl,
          config,
          recipientInputs,
          (current, t) => setProgress({ current, total: t })
        );

        let index = 0;
        let skipped = 0;
        for await (const { name, blob } of generator) {
          if (cancelledRef.current) break;

          const recipient = recipients[index];
          index++;

          try {
            const safeName = name.replace(/[^a-zA-Z0-9_\- ]/g, "").replace(/\s+/g, "_") || recipient.id;
            const storagePath = `certificates/${storageFolderName}/${safeName}.${config.outputFormat}`;

            await uploadFile(supabase, "autocert", storagePath, blob, {
              contentType: `image/${config.outputFormat}`,
              upsert: true,
            });

            const publicUrl = getPublicUrl(supabase, storagePath);

            batchResults.push({
              recipientId: recipient.id,
              recipientName: name,
              imageUrl: publicUrl,
            });

            dbInputs.push({
              recipient_id: recipient.id,
              template_id: templateId,
              image_url: publicUrl,
            });
          } catch {
            skipped++;
            // Continue with next certificate instead of crashing the batch
          }
        }

        if (skipped > 0) {
          setError(`${skipped} certificate${skipped !== 1 ? "s" : ""} failed to upload`);
        }

        if (!cancelledRef.current && dbInputs.length > 0) {
          await generatedCertRepo.createMany(supabase, dbInputs);
        }

        setResults(batchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Generation failed");
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  return {
    progress,
    isGenerating,
    results,
    error,
    generate,
    cancel,
  };
}
