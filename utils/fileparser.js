

import { parse } from "csv-parse";

export function parseFileStream(buffer, onRow = () => {}) {
  return new Promise((resolve, reject) => {
    const parser = parse({ trim: true });

    let headers = [];
    let headerIndexMap = {};
    let rowIndex = 0;

    parser.on("readable", () => {
      let record;
      while ((record = parser.read())) {
        rowIndex++;

        if (rowIndex === 1) {
          headers = record.filter(
            h => h !== "Columns in red are mandatory"
          );
          record.forEach((h, i) => (headerIndexMap[h] = i));
          continue;
        }

        if (rowIndex === 2) continue;

        const obj = {};
        headers.forEach(h => {
          obj[h] = record[headerIndexMap[h]] ?? null;
        });

        if (
          obj["Customer email"] ||
          obj["Variant ID"] ||
          obj["Variant quantity"]
        ) {
          onRow(obj); // ✅ safe now
        }
      }
    });

    parser.on("end", resolve);
    parser.on("error", reject);

    parser.write(buffer);
    parser.end();
  });
}

