function escapeCsvCell(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export interface CsvColumn<T> {
  key: keyof T | string;
  header: string;
  resolve?: (row: T) => string | number | boolean | null | undefined;
}

export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: CsvColumn<T>[]
): string {
  const headerLine = columns.map((c) => escapeCsvCell(c.header)).join(",");
  const rowLines = rows.map((row) =>
    columns
      .map((col) => {
        const value = col.resolve ? col.resolve(row) : row[col.key as keyof T];
        return escapeCsvCell(value == null ? "" : String(value));
      })
      .join(",")
  );
  return [headerLine, ...rowLines].join("\n");
}

export function downloadCsvFile(filename: string, csv: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
