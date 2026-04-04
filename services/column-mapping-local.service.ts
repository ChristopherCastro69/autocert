import type { MappingResult, MapColumnsResponse } from "@/types";

const FIRST_NAME_PATTERNS = [
  /^first[_ ]?name$/i,
  /^given[_ ]?name$/i,
  /^first$/i,
  /^fname$/i,
  /^forename$/i,
];

const LAST_NAME_PATTERNS = [
  /^last[_ ]?name$/i,
  /^surname$/i,
  /^family[_ ]?name$/i,
  /^last$/i,
  /^lname$/i,
];

const EMAIL_PATTERNS = [
  /^e-?mail$/i,
  /^email[_ ]?addr(ess)?$/i,
  /^contact[_ ]?email$/i,
];

const FULL_NAME_PATTERNS = [
  /^full[_ ]?name$/i,
  /^name$/i,
  /^participant[_ ]?name$/i,
  /^attendee[_ ]?name$/i,
  /^student[_ ]?name$/i,
  /^recipient[_ ]?name$/i,
  /^participant$/i,
  /^attendee$/i,
];

function matchHeader(headers: string[], patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = headers.find((h) => pattern.test(h.trim()));
    if (match) return match;
  }
  return null;
}

export function mapColumnsLocally(headers: string[]): MapColumnsResponse {
  const mapping: MappingResult = {
    firstName: matchHeader(headers, FIRST_NAME_PATTERNS),
    lastName: matchHeader(headers, LAST_NAME_PATTERNS),
    email: matchHeader(headers, EMAIL_PATTERNS),
    fullName: matchHeader(headers, FULL_NAME_PATTERNS),
  };

  // If we found firstName/lastName, clear fullName to avoid confusion
  if (mapping.firstName && mapping.lastName) {
    mapping.fullName = null;
  }

  // Calculate confidence based on how many fields were matched
  const hasName = !!(mapping.firstName && mapping.lastName) || !!mapping.fullName;
  const hasEmail = !!mapping.email;
  const confidence = hasName && hasEmail ? 0.9 : hasName ? 0.7 : 0.3;

  return { mapping, confidence };
}
