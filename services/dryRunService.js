import fs from "fs";
import path from "path";

import { parseFileFromPath } from "../utils/fileParserFromPath.util.js";
import { validateSubscriptionRow } from "../validators/subscriptionRow.validator.js";
import { shopifyValidation } from "../validators/shopify.validator.js";
import { updateMigration } from "./migration.service.js";
import { createDryRunCsvWriter } from "../utils/dryRunCsvWriter.util.js";

export async function runDryRun(migration) {
    const originalFilePath = migration.file_path;

    const reportDir = path.join("uploads/migrations", String(migration.id));
    const reportPath = path.join(reportDir, "dry_run_report.csv");


    fs.mkdirSync(reportDir, { recursive: true });

    const writer = createDryRunCsvWriter(reportPath);

    let rowIndex = 0;
    let hasErrors = false;
    let combinedErrors = [];

    await parseFileFromPath(originalFilePath, async (row) => {
        const index = rowIndex++;

        const rowErrors = await validateSubscriptionRow(row, index);
        const shopifyErrors = await shopifyValidation(row, index);

        combinedErrors = [...rowErrors, ...shopifyErrors];

        if (combinedErrors.length > 0) {
            hasErrors = true;
        }

        writer.writeRow(row, combinedErrors);
    });

    writer.end();


    // 🔥 NOW DB update
    if (hasErrors) {
        await updateMigration(migration.id, {
            status: "dry_run_failed",
            dry_run_report_path: reportPath
        });
    } else {
        await updateMigration(migration.id, {
            status: "ready_for_execution",
            dry_run_report_path: reportPath
        });
    }

}
