"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import type { Recipient } from "@/types";

interface RecipientTableProps {
  recipients: Recipient[];
  onDelete: (ids: string[]) => void;
  deleting: boolean;
}

export function RecipientTable({ recipients, onDelete, deleting }: RecipientTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = recipients.length > 0 && selected.size === recipients.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(recipients.map((r) => r.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    onDelete(Array.from(selected));
    setSelected(new Set());
  };

  return (
    <div className="space-y-2">
      {selected.size > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {selected.size} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {deleting ? "Deleting..." : "Delete Selected"}
          </Button>
        </div>
      )}

      <div className="rounded-md border overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              <th className="p-3 text-left font-medium">First Name</th>
              <th className="p-3 text-left font-medium">Last Name</th>
              <th className="p-3 text-left font-medium">Email</th>
              <th className="p-3 w-16" />
            </tr>
          </thead>
          <tbody>
            {recipients.map((r) => (
              <tr key={r.id} className="border-b last:border-b-0">
                <td className="p-3">
                  <Checkbox
                    checked={selected.has(r.id)}
                    onCheckedChange={() => toggleOne(r.id)}
                  />
                </td>
                <td className="p-3">{r.first_name}</td>
                <td className="p-3">{r.last_name}</td>
                <td className="p-3 text-muted-foreground">{r.email ?? "-"}</td>
                <td className="p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete([r.id])}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
