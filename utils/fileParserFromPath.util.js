import fs from "fs";
import { parse } from "csv-parse";

export async function parseFileFromPath(filePath, onRow, options = {}) {
  const {
    skipSecondRow = false   // 🔥 subscription = true, payment = false
  } = options;

  const parser = parse({ trim: true });
  const stream = fs.createReadStream(filePath).pipe(parser);

  let headers = [];
  let headerIndexMap = {};
  let rowIndex = 0;

  for await (const record of stream) {
    rowIndex++;

    // HEADER
    if (rowIndex === 1) {
      headers = record;
      record.forEach((h, i) => (headerIndexMap[h] = i));
      continue;
    }

    // OPTIONAL instruction row (subscription only)
    if (rowIndex === 2 && skipSecondRow) {
      continue;
    }

    const obj = {};
    headers.forEach(h => {
      obj[h] = record[headerIndexMap[h]] ?? null;
    });

    // 🔥 DRY RUN → NEVER SKIP ROWS
    await onRow(obj);
  }
}
