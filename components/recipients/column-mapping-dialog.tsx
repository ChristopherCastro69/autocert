"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MappingResult } from "@/types";

const NONE_VALUE = "__none__";

const REQUIRED_FIELDS: { key: keyof MappingResult; label: string }[] = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "fullName", label: "Full Name (combined)" },
  { key: "email", label: "Email" },
];

interface ColumnMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headers: string[];
  mapping: MappingResult;
  onMappingChange: (field: keyof MappingResult, value: string | null) => void;
  onConfirm: () => void;
  confirming: boolean;
}

export function ColumnMappingDialog({
  open,
  onOpenChange,
  headers,
  mapping,
  onMappingChange,
  onConfirm,
  confirming,
}: ColumnMappingDialogProps) {
  const hasNameMapping =
    (mapping.firstName && mapping.lastName) || mapping.fullName;
  const hasEmail = !!mapping.email;
  const isValid = hasNameMapping && hasEmail;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Map Columns</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Map your file columns to the required fields. Use either First
          Name + Last Name, or a combined Full Name column.
        </p>

        <div className="space-y-4 mt-2">
          {REQUIRED_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4">
              <Label className="w-36 shrink-0 text-sm">{label}</Label>
              <Select
                value={mapping[key] ?? NONE_VALUE}
                onValueChange={(v) =>
                  onMappingChange(key, v === NONE_VALUE ? null : v)
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>-- None --</SelectItem>
                  {headers.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {!isValid && (
          <p className="text-sm text-destructive mt-2">
            Please map Email and either First Name + Last Name or Full Name.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={confirming}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={!isValid || confirming}>
            {confirming ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
