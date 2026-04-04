"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGuest } from "@/components/context/guest-context";
import { parseFile } from "@/services/xlsx-parser.service";
import { mapColumnsLocally } from "@/services/column-mapping-local.service";
import { transformRows } from "@/utils/transform-recipients";
import { ColumnMappingDialog } from "@/components/recipients/column-mapping-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MappingResult } from "@/types";
import { Upload, FileSpreadsheet, Users, AlertCircle } from "lucide-react";

export default function GuestRecipientsPage() {
  const router = useRouter();
  const { recipients, setRecipients, templateObjectUrl } = useGuest();

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setError(null);

    try {
      const parsed = await parseFile(file);
      setHeaders(parsed.headers);
      setRows(parsed.rows);

      // Auto-map columns via local heuristic (no server call)
      const result = mapColumnsLocally(parsed.headers);
      setMapping(result.mapping);

      // Open mapping dialog
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

  const handleConfirm = () => {
    setConfirming(true);

    try {
      const transformed = transformRows(rows, mapping);
      const guestRecipients = transformed.map((r) => ({
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email ?? undefined,
      }));

      setRecipients(guestRecipients);
      setMappingOpen(false);

      // Reset file input
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process recipients");
    } finally {
      setConfirming(false);
    }
  };

  const handleContinue = () => {
    router.push("/guest/generate");
  };

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Recipients</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a CSV or XLSX file with recipient names. The data is parsed in your browser and never sent to any server.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recipient File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              disabled={parsing}
            />
            {parsing && (
              <p className="text-sm text-muted-foreground whitespace-nowrap">Parsing...</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Your file should have columns for first name, last name (or full name), and optionally email.
            Column mapping will be suggested automatically.
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* Show loaded recipients */}
      {recipients.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              {recipients.length} Recipient{recipients.length !== 1 ? "s" : ""} Loaded
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRecipients([]);
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.slice(0, 10).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>{r.firstName}</TableCell>
                      <TableCell>{r.lastName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.email || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {recipients.length > 10 && (
              <p className="text-xs text-muted-foreground mt-2">
                Showing first 10 of {recipients.length} recipients
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {recipients.length > 0 && (
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={() => router.push("/guest/template")}>
            Back to Template
          </Button>
          <Button onClick={handleContinue}>
            Continue to Generate
          </Button>
        </div>
      )}

      <ColumnMappingDialog
        open={mappingOpen}
        onOpenChange={setMappingOpen}
        headers={headers}
        mapping={mapping}
        onMappingChange={handleMappingChange}
        onConfirm={handleConfirm}
        confirming={confirming}
      />
    </div>
  );
}
