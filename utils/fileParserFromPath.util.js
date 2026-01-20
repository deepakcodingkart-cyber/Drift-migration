import fs from "fs";
import { parse } from "csv-parse";

export async function parseFileFromPath(filePath, onRow) {
  const parser = parse({ trim: true });
  const stream = fs.createReadStream(filePath).pipe(parser);

  let headers = [];
  let headerIndexMap = {};
  let rowIndex = 0;

  for await (const record of stream) {
    rowIndex++;

    // Header row
    if (rowIndex === 1) {
      headers = record.filter(
        h => h !== "Columns in red are mandatory"
      );
      record.forEach((h, i) => (headerIndexMap[h] = i));
      continue;
    }

    // Skip instruction row
    if (rowIndex === 2) continue;

    const obj = {};
    headers.forEach(h => {
      obj[h] = record[headerIndexMap[h]] ?? null;
    });

    // 🔥 DRY RUN → NEVER SKIP ROWS
    await onRow(obj);
  }
}
