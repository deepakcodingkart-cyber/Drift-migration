import fs from "fs";
import path from "path";

import { parseFileFromPath } from "../utils/fileParserFromPath.util.js";
import { updateMigration } from "./migration.service.js";
import {
  getMigrationFiles,
  updateMigrationFileStatus
} from "./migrationFiles.service.js";

import { createDryRunCsvWriter } from "../utils/dryRunCsvWriter.util.js";

import { validateSubscriptionRow } from "../validators/subscriptionRow.validator.js";
import { shopifyValidation } from "../validators/shopify.validator.js";

import { validateStripeRow } from "../validators/payment/stripe.validator.js";
import { validatePaypalRow } from "../validators/payment/paypal.validator.js";
import { validateBraintreeRow } from "../validators/payment/braintree.validator.js";

/**
 * DRY RUN SERVICE (FINAL – CONSISTENT ERROR SHAPE)
 *
 * PASS 1 → Collect payment emails from ALL payment files
 * PASS 2 → Validate ONLY pending files + generate dry-run CSV
 */
export async function runDryRun(migration) {
  console.log("🚀 Starting dry run for migration:", migration.id);
  const migrationId = migration.id;

  /* =====================================
     1️⃣ LOAD ALL FILES
  ===================================== */
  const allFiles = await getMigrationFiles(migrationId);

  if (!allFiles || allFiles.length === 0) {
    console.log("No files found for migration");
    return;
  }

  /* =====================================
     2️⃣ FILTER PENDING FILES
  ===================================== */
  const pendingFiles = allFiles.filter(
    f => f.dry_run_status === "pending"
  );

  if (pendingFiles.length === 0) {
    console.log("No pending files for dry run");
    return;
  }

  const dryRunDir = path.join(
    "uploads",
    "migrations",
    String(migrationId),
    "dry_run"
  );
  fs.mkdirSync(dryRunDir, { recursive: true });

  let migrationHasErrors = false;

  /* =====================================================
     🔁 PASS 1 — COLLECT PAYMENT EMAILS (ALL FILES)
  ===================================================== */
  const paymentEmailSet = new Set();

  for (const file of allFiles) {
    const { file_type, file_path } = file;

    if (
      file_type === "stripe_payment_csv" ||
      file_type === "paypal_payment_csv" ||
      file_type === "payment_braintree_csv"
    ) {
      await parseFileFromPath(file_path, async (row) => {
        const email = row.Email?.toLowerCase().trim();
        if (email) paymentEmailSet.add(email);
      });
    }
  }

  /* =====================================================
     🔁 PASS 2 — VALIDATE + DRY RUN CSV
  ===================================================== */
  for (const file of pendingFiles) {
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

    await parseFileFromPath(
      file_path,
      async (row) => {
        const index = rowIndex++;
        let errors = [];

        /* ---------- ROUTE VALIDATION ---------- */

        // 🔹 SUBSCRIPTION CSV
        if (file_type === "subscription_csv") {
          const localErrors = await validateSubscriptionRow(row, index);
          const shopifyErrors = await shopifyValidation(row, index);
          errors = [...localErrors, ...shopifyErrors];

          const subscriptionEmail =
            row["Customer email"]?.toLowerCase().trim();

          if (
            subscriptionEmail &&
            paymentEmailSet.size > 0 &&
            !paymentEmailSet.has(subscriptionEmail)
          ) {
            errors.push({
              row: index + 1,
              field: "Customer email",
              code: "PAYMENT_NOT_FOUND",
              message:
                "No payment found for this customer email in uploaded payment files"
            });
          }
        }

        // 🔹 STRIPE PAYMENT CSV
        else if (file_type === "stripe_payment_csv") {
          errors = await validateStripeRow(row, index, seen);
        }

        // 🔹 PAYPAL PAYMENT CSV
        else if (file_type === "paypal_payment_csv") {
          errors = await validatePaypalRow(row, index, seen);
        }

        // 🔹 BRAINTREE PAYMENT CSV
        else if (file_type === "payment_braintree_csv") {
          errors = await validateBraintreeRow(row, index, seen);
        }

        // 🔹 UNSUPPORTED FILE
        else {
          errors.push({
            row: index + 1,
            field: "file_type",
            code: "UNSUPPORTED_FILE_TYPE",
            message: `Unsupported file type: ${file_type}`
          });
        }

        if (errors.length > 0) {
          fileHasErrors = true;
          migrationHasErrors = true;
        }

        writer.writeRow(row, errors);
      },
      { skipSecondRow }
    );

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

  console.log(
    `✅ Dry run completed for migration ${migrationId} | status: ${
      migrationHasErrors ? "completed_with_errors" : "completed"
    }`
  );
}
