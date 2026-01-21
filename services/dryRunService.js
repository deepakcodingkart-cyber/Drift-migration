import fs from "fs";
import path from "path";

import { parseFileFromPath } from "../utils/fileParserFromPath.util.js";
import { updateMigration } from "./migration.service.js";
import { getMigrationFiles, updateMigrationFileStatus } from "./migrationFiles.service.js";

import { createDryRunCsvWriter } from "../utils/dryRunCsvWriter.util.js";

import { validateSubscriptionRow } from "../validators/subscriptionRow.validator.js";
import { shopifyValidation } from "../validators/shopify.validator.js";

import { validateStripeRow } from "../validators/payment/stripe.validator.js";
import { validatePaypalRow } from "../validators/payment/paypal.validator.js";
import { validateBraintreeRow } from "../validators/payment/braintree.validator.js";

/**
 * DRY RUN SERVICE
 * - Reads ALL uploaded CSVs for a migration
 * - Runs validation per file_type
 * - Generates dry-run CSV per file
 * - Updates migration_files + migrations status
 */
export async function runDryRun(migration) {
  console.log("Starting dry run for migration ID:", migration.id);
  const migrationId = migration.id;

  /* =====================================
     1️⃣ LOAD FILES
  ===================================== */
  const files = await getMigrationFiles(migrationId);
  console.log("Files for dry run:", files, "Migration ID:", migrationId);


  if (!files || files.length === 0) {
    throw new Error("No files found for dry run");
  }

  const dryRunDir = path.join(
    "uploads",
    "migrations",
    String(migrationId),
    "dry_run"
  );

  fs.mkdirSync(dryRunDir, { recursive: true });

  let migrationHasErrors = false;

  /* =====================================
     2️⃣ PROCESS EACH FILE
  ===================================== */
  for (const file of files) {
    const { file_type, file_path } = file;
    console.log(`Processing file type: ${file_type}, path: ${file_path}`);

    let fileHasErrors = false;
    let rowIndex = 0;
    const seen = new Set();

    const reportPath = path.join(
      dryRunDir,
      `${file_type}_report_dry_run.csv`
    );

    const writer = createDryRunCsvWriter(reportPath);

    const skipSecondRow = file_type === "subscription_csv";
    console.log(`Dry run report will be written to: ${reportPath}`);

    await parseFileFromPath(file_path, async (row) => {
      const index = rowIndex++;
      let errors = [];

      /* ---------- ROUTE VALIDATION ---------- */

      if (file_type === "subscription_csv") {
        const localErrors = await validateSubscriptionRow(row, index);
        const shopifyErrors = await shopifyValidation(row, index);
        errors = [...localErrors, ...shopifyErrors];
        console.log(`subscription validation errors:`, errors);
      }

      else if (file_type === "stripe_payment_csv") {
        errors = await validateStripeRow(row, index, seen);

      }

      else if (file_type === "paypal_payment_csv") {
        errors = await validatePaypalRow(row, index, seen);
      }

      else if (file_type === "payment_braintree_csv") {
        errors = await validateBraintreeRow(row, index, seen);
      }

      else {
        errors.push({
          row: index + 1,
          field: "file_type",
          message: `Unsupported file type: ${file_type}`
        });
      }

      if (errors.length > 0) {
        fileHasErrors = true;
        migrationHasErrors = true;
      }

      writer.writeRow(row, errors);
    },
      { skipSecondRow });

    writer.end();

    /* =====================================
       3️⃣ UPDATE FILE STATUS
    ===================================== */
    await updateMigrationFileStatus({
      migration_id: migrationId,
      file_type,
      dry_run_status: fileHasErrors ? "failed" : "passed",
      dry_run_report_path: reportPath
    });

  }

  /* =====================================
     4️⃣ UPDATE MIGRATION STATUS
  ===================================== */
  await updateMigration(migrationId, {
    status: migrationHasErrors
      ? "completed_with_errors"
      : "completed"
  });
  console.log(`Dry run completed for migration ID: ${migrationId} with status: ${migrationHasErrors ? "completed_with_errors" : "completed"}`);
}
