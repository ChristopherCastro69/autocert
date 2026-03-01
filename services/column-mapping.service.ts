import { MapColumnsResponse } from "@/types";

export async function mapColumns(
  headers: string[],
  sampleRows: Record<string, string>[]
): Promise<MapColumnsResponse> {
  const response = await fetch("/api/map-columns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ headers, sampleRows }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Column mapping failed: ${errorText}`);
  }

  return response.json();
}
