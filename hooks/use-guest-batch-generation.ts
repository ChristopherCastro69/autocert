"use client";

import { useState, useCallback, useRef } from "react";
import { TemplateTextConfig } from "@/types";
import { GuestRecipient } from "@/types/guest";
import { generateBatch } from "@/services/certificate.service";

interface BatchProgress {
  current: number;
  total: number;
}

export interface GuestBatchResult {
  name: string;
  blob: Blob;
}

export function useGuestBatchGeneration() {
  const [progress, setProgress] = useState<BatchProgress>({ current: 0, total: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GuestBatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  const generate = useCallback(
    async (
      templateUrl: string,
      config: TemplateTextConfig,
      recipients: GuestRecipient[]
    ) => {
      setIsGenerating(true);
      setError(null);
      setResults([]);
      cancelledRef.current = false;

      const total = recipients.length;
      setProgress({ current: 0, total });

      const batchResults: GuestBatchResult[] = [];

      try {
        const generator = generateBatch(
          templateUrl,
          config,
          recipients,
          (current, t) => setProgress({ current, total: t })
        );

        for await (const { name, blob } of generator) {
          if (cancelledRef.current) break;
          batchResults.push({ name, blob });
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

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    progress,
    isGenerating,
    results,
    error,
    generate,
    cancel,
    clearResults,
  };
}
