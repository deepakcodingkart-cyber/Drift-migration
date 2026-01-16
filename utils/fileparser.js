// import XLSX from "xlsx";

// export default function parseFile(buffer) {
//   const workbook = XLSX.read(buffer, { type: "buffer" });
//   const sheetName = workbook.SheetNames[0];
//   const sheet = workbook.Sheets[sheetName];

//   const rows = XLSX.utils.sheet_to_json(sheet, {
//     header: 1,
//     defval: null,
//     raw: false
//   });

//   if (!rows || rows.length < 2) {
//     return [];
//   }

//   // 🔥 HEADERS (REMOVE UNWANTED COLUMN)
//   const headers = rows[0]
//     .map(h => String(h).trim())
//     .filter(h => h !== "Columns in red are mandatory"); // 👈 REMOVE THIS COLUMN

//   // Data starts after header + description row
//   const dataRows = rows.slice(2);

//   const result = dataRows
//     .map((row) => {
//       const obj = {};

//       headers.forEach((header, headerIndex) => {
//         // Find actual column index from original header row
//         const originalIndex = rows[0].indexOf(header);
//         obj[header] = row[originalIndex] ?? null;
//       });

//       // ✅ REAL DATA CHECK (skip example/comment rows)
//       const hasRealData =
//         obj["Customer email"] ||
//         obj["Variant ID"] ||
//         obj["Variant quantity"];

//       return hasRealData ? obj : null;
//     })
//     .filter(Boolean);

//   return result;
// }

import XLSX from "xlsx";

/**
 * Converts CSV or XLSX buffer into normalized row objects
 * Output format remains SAME as before
 */
export default function parseFile(buffer) {
  // 1️⃣ Read workbook (CSV or XLSX both supported)
  const workbook = XLSX.read(buffer, { type: "buffer" });

  // 2️⃣ First sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // 3️⃣ Convert sheet → CSV
  const csv = XLSX.utils.sheet_to_csv(sheet, {
    blankrows: false
  });

  // 4️⃣ CSV → JSON rows (array of arrays)
  const rows = XLSX.utils.sheet_to_json(
    XLSX.read(csv, { type: "string" }).Sheets[
      XLSX.read(csv, { type: "string" }).SheetNames[0]
    ],
    {
      header: 1,
      defval: null,
      raw: false
    }
  );

  if (!rows || rows.length < 2) return [];

  /* ---------- HEADERS ---------- */
  const headers = rows[0]
    .map(h => String(h).trim())
    .filter(h => h !== "Columns in red are mandatory");

  // Data starts after header + description row
  const dataRows = rows.slice(2);

  /* ---------- BUILD OBJECT ROWS ---------- */
  const result = dataRows
    .map(row => {
      const obj = {};

      headers.forEach(header => {
        const originalIndex = rows[0].indexOf(header);
        obj[header] = row[originalIndex] ?? null;
      });

      // Skip empty/example rows
      const hasRealData =
        obj["Customer email"] ||
        obj["Variant ID"] ||
        obj["Variant quantity"];

      return hasRealData ? obj : null;
    })
    .filter(Boolean);

  return result;
}

