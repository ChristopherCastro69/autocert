import type { MappingResult } from "@/types";

interface TransformedRecipient {
  firstName: string;
  lastName: string;
  email: string | null;
}

export function transformRows(
  rows: Record<string, string>[],
  mapping: MappingResult
): TransformedRecipient[] {
  return rows.map((row) => {
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
      firstName,
      lastName,
      email: mapping.email ? (row[mapping.email] ?? null) : null,
    };
  });
}
