import fs from "fs";
import { stringify } from "csv-stringify";

export function createDryRunCsvWriter(filePath) {
  const output = fs.createWriteStream(filePath);

  const stringifier = stringify({
    header: true
  });

  stringifier.pipe(output);

  let wroteAnyRow = false;

  return {
    writeRow(row, errors) {
      wroteAnyRow = true;

      stringifier.write({
        ...row,
        dry_run_status: errors.length ? "FAILED" : "PASSED",
        error_count: errors.length,
        error_codes: errors.map(e => e.code || "VALIDATION_ERROR").join(";"),
        error_messages: errors.map(e => e.message).join(" | ")
      });
    },

    end() {
      // 🔑 If no rows were written, still end stream
      stringifier.end();
    }
  };
}

