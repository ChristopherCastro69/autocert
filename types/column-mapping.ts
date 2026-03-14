export interface ColumnMapping {
  id: string;
  event_id: string;
  original_headers: string[];
  mapping: MappingResult;
  confirmed: boolean;
  created_at: string;
}

export interface MappingResult {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  fullName: string | null;
}

export interface MapColumnsRequest {
  headers: string[];
  sampleRows: Record<string, string>[];
}

export interface MapColumnsResponse {
  mapping: MappingResult;
  confidence: number;
}
