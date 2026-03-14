"use client";

import { useState, useCallback } from "react";
import { mapColumns as mapColumnsService } from "@/services/column-mapping.service";
import type { MappingResult } from "@/types";

export function useColumnMapping() {
  const [mapping, setMapping] = useState<MappingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapColumns = useCallback(
    async (headers: string[], sampleRows: Record<string, string>[]) => {
      setLoading(true);
      setError(null);

      try {
        const result = await mapColumnsService(headers, sampleRows);
        setMapping(result.mapping);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Mapping failed";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateMapping = useCallback(
    (field: keyof MappingResult, value: string | null) => {
      setMapping((prev) =>
        prev ? { ...prev, [field]: value } : prev
      );
    },
    []
  );

  const reset = useCallback(() => {
    setMapping(null);
    setLoading(false);
    setError(null);
  }, []);

  return { mapping, loading, error, mapColumns, updateMapping, reset };
}
