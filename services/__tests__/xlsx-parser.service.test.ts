import { describe, it, expect } from "vitest";
import { parseFile } from "../xlsx-parser.service";
import * as XLSX from "xlsx";

function createFileFromString(
  content: string,
  name: string,
  type: string
): File {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

function createXlsxFile(
  data: Record<string, string>[],
  name: string
): File {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  return new File([blob], name);
}

describe("parseFile", () => {
  it("parses CSV files correctly", async () => {
    const csv = "Name,Email\nAlice,alice@test.com\nBob,bob@test.com";
    const file = createFileFromString(csv, "test.csv", "text/csv");

    const result = await parseFile(file);

    expect(result.headers).toEqual(["Name", "Email"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ Name: "Alice", Email: "alice@test.com" });
    expect(result.rows[1]).toEqual({ Name: "Bob", Email: "bob@test.com" });
  });

  it("parses XLSX files correctly", async () => {
    const data = [
      { FirstName: "Alice", LastName: "Smith" },
      { FirstName: "Bob", LastName: "Jones" },
    ];
    const file = createXlsxFile(data, "test.xlsx");

    const result = await parseFile(file);

    expect(result.headers).toEqual(["FirstName", "LastName"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ FirstName: "Alice", LastName: "Smith" });
  });

  it("throws error for unsupported file types", async () => {
    const file = createFileFromString("{}", "test.json", "application/json");

    await expect(parseFile(file)).rejects.toThrow("Unsupported file format");
  });

  it("throws error for empty CSV files", async () => {
    const csv = "Name,Email\n";
    const file = createFileFromString(csv, "empty.csv", "text/csv");

    await expect(parseFile(file)).rejects.toThrow(
      "The file is empty or contains no data rows"
    );
  });

  it("converts non-string values to strings", async () => {
    const data = [{ Name: "Alice", Age: "30" as string }];
    const file = createXlsxFile(data, "typed.xlsx");

    const result = await parseFile(file);

    expect(typeof result.rows[0]["Age"]).toBe("string");
  });
});
