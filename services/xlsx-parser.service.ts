import * as XLSX from "xlsx";

export interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!extension || !["csv", "xlsx", "xls"].includes(extension)) {
    throw new Error(
      `Unsupported file format: .${extension ?? "unknown"}. Please use .csv, .xlsx, or .xls`
    );
  }

  let workbook: XLSX.WorkBook;

  if (extension === "csv") {
    const text = await file.text();
    workbook = XLSX.read(text, { type: "string" });
  } else {
    const buffer = await file.arrayBuffer();
    workbook = XLSX.read(buffer, { type: "array" });
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("The file contains no sheets");
  }

  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    header: undefined,
    defval: "",
  });

  if (jsonData.length === 0) {
    throw new Error("The file is empty or contains no data rows");
  }

  const headers = Object.keys(jsonData[0]);
  const rows = jsonData.map((row) => {
    const stringRow: Record<string, string> = {};
    for (const key of headers) {
      stringRow[key] = String(row[key] ?? "");
    }
    return stringRow;
  });

  return { headers, rows };
}
