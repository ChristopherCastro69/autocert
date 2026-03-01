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
import { parseFile } from "@/services/xlsx-parser.service";
import { mapColumns } from "@/services/column-mapping.service";
import { ColumnMappingDialog } from "./column-mapping-dialog";
import { createClient } from "@/lib/supabase/client";
import type { MappingResult } from "@/types";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onUploaded: () => void;
}

export function UploadDialog({ open, onOpenChange, eventId, onUploaded }: UploadDialogProps) {
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parsed file state
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);

  // Column mapping state
  const [mappingOpen, setMappingOpen] = useState(false);
  const [mapping, setMapping] = useState<MappingResult>({
    firstName: null,
    lastName: null,
    email: null,
    fullName: null,
  });
  const [confirming, setConfirming] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setError(null);
    setHeaders([]);
    setRows([]);
    setMapping({ firstName: null, lastName: null, email: null, fullName: null });
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setError(null);

    try {
      const parsed = await parseFile(file);
      setHeaders(parsed.headers);
      setRows(parsed.rows);

      // Auto-map columns via AI
      const sampleRows = parsed.rows.slice(0, 3);
      const result = await mapColumns(parsed.headers, sampleRows);
      setMapping(result.mapping);

      // Close upload dialog, open mapping dialog
      onOpenChange(false);
      setMappingOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setParsing(false);
    }
  };

  const handleMappingChange = (field: keyof MappingResult, value: string | null) => {
    setMapping((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = async () => {
    setConfirming(true);

    try {
      const supabase = createClient();

      const recipients = rows.map((row) => {
        let firstName = "";
        let lastName = "";

        if (mapping.fullName) {
          const parts = (row[mapping.fullName] ?? "").trim().split(/\s+/);
          firstName = parts[0] ?? "";
          lastName = parts.slice(1).join(" ");
        } else {
          firstName = mapping.firstName ? (row[mapping.firstName] ?? "") : "";
          lastName = mapping.lastName ? (row[mapping.lastName] ?? "") : "";
        }

        return {
          event_id: eventId,
          first_name: firstName,
          last_name: lastName,
          email: mapping.email ? (row[mapping.email] ?? null) : null,
        };
      });

      const { error: insertError } = await supabase
        .from("recipients")
        .insert(recipients);

      if (insertError) throw new Error(insertError.message);

      setMappingOpen(false);
      reset();
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to insert recipients");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) reset();
          onOpenChange(v);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Recipients</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipients-file">Select File (.csv or .xlsx)</Label>
              <Input
                id="recipients-file"
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                disabled={parsing}
              />
            </div>

            {parsing && (
              <p className="text-sm text-muted-foreground">Parsing file and mapping columns...</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={parsing}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ColumnMappingDialog
        open={mappingOpen}
        onOpenChange={setMappingOpen}
        headers={headers}
        mapping={mapping}
        onMappingChange={handleMappingChange}
        onConfirm={handleConfirm}
        confirming={confirming}
      />
    </>
  );
}
