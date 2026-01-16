import XLSX from "xlsx";

export default function parseFile(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: false
  });

  if (!rows || rows.length < 2) {
    return [];
  }

  // 🔥 HEADERS (REMOVE UNWANTED COLUMN)
  const headers = rows[0]
    .map(h => String(h).trim())
    .filter(h => h !== "Columns in red are mandatory"); // 👈 REMOVE THIS COLUMN

  // Data starts after header + description row
  const dataRows = rows.slice(2);

  const result = dataRows
    .map((row) => {
      const obj = {};

      headers.forEach((header, headerIndex) => {
        // Find actual column index from original header row
        const originalIndex = rows[0].indexOf(header);
        obj[header] = row[originalIndex] ?? null;
      });

      // ✅ REAL DATA CHECK (skip example/comment rows)
      const hasRealData =
        obj["Customer email"] ||
        obj["Variant ID"] ||
        obj["Variant quantity"];

      return hasRealData ? obj : null;
    })
    .filter(Boolean);

  return result;
}
