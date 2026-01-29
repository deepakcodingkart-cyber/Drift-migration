import fs from "fs";
import path from "path";

import { parseFileFromPath } from "../utils/fileParserFromPath.util.js";
import { updateMigration } from "../db/services/migration.service.js";
import {
  getMigrationFiles,
  updateMigrationFileStatus
} from "../db/services/migrationFiles.service.js";

import { createDryRunCsvWriter } from "../utils/dryRunCsvWriter.util.js";

import { validateSubscriptionRow } from "../validators/subscriptionRow.validator.js";
import { shopifyValidation } from "../validators/shopify.validator.js";

import { validateStripeRow } from "../validators/payment/stripe.validator.js";
import { validatePaypalRow } from "../validators/payment/paypal.validator.js";
import { validateBraintreeRow } from "../validators/payment/braintree.validator.js";

import { resolveShopifyCustomerByEmail } from "./shopify/resolveShopifyCustomerByEmail.js";
/**
 * DRY RUN SERVICE (FINAL)
 *
 * RULES:
 * - Shopify customer existence check → ONLY PAYMENT FILES
 * - Subscription CSV → ONLY checks payment availability
 * - No Shopify writes
 * - Row-level error CSV
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

  /* =====================================
     🔒 GLOBAL CACHE
  ===================================== */
  const paymentEmailSet = new Set();        // emails from payment CSVs
  const shopifyCustomerCache = new Map();   // email -> customerId | null

  /* =====================================
     2️⃣ PASS 1 — COLLECT PAYMENT EMAILS
  ===================================== */
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

  /* =====================================
     3️⃣ PASS 2 — VALIDATION + CSV
  ===================================== */
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

          const email =
            row["Customer email"]?.toLowerCase().trim();

          // 🔑 ONLY payment existence check
          if (
            email &&
            paymentEmailSet.size > 0 &&
            !paymentEmailSet.has(email)
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

        /* =====================================
           STRIPE PAYMENT CSV
        ===================================== */
        else if (file_type === "stripe_payment_csv") {
          errors = await validateStripeRow(row, index, seen);

          await checkShopifyCustomer({
            row,
            index,
            errors,
            shopifyCustomerCache
          });
        }

        /* =====================================
           PAYPAL PAYMENT CSV
        ===================================== */
        else if (file_type === "paypal_payment_csv") {
          errors = await validatePaypalRow(row, index, seen);

          await checkShopifyCustomer({
            row,
            index,
            errors,
            shopifyCustomerCache
          });
        }

        /* =====================================
           BRAINTREE PAYMENT CSV
        ===================================== */
        else if (file_type === "payment_braintree_csv") {
          errors = await validateBraintreeRow(row, index, seen);

          await checkShopifyCustomer({
            row,
            index,
            errors,
            shopifyCustomerCache
          });
        }

        /* =====================================
           AUTHORIZE.NET PAYMENT CSV
        ===================================== */
        else if (file_type === "authorizedotnet_payment_csv") {
          errors = await validateAuthorizeNetRow(row, index, seen);

          await checkShopifyCustomer({
            row,
            index,
            errors,
            shopifyCustomerCache
          });
        }

        /* =====================================
           UNSUPPORTED FILE
        ===================================== */
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

    await updateMigrationFileStatus({
      migration_id: migrationId,
      file_type,
      dry_run_status: fileHasErrors ? "failed" : "passed",
      dry_run_report_path: reportPath
    });
  }

  /* =====================================
     4️⃣ MIGRATION STATUS
  ===================================== */
  await updateMigration(migrationId, {
    status: migrationHasErrors
      ? "completed_with_errors"
      : "completed"
  });

  console.log(
    `✅ Dry run completed | status: ${
      migrationHasErrors ? "completed_with_errors" : "completed"
    }`
  );
}

/* =====================================
   🔥 COMMON SHOPIFY CHECK (PAYMENT ONLY)
===================================== */
async function checkShopifyCustomer({
  row,
  index,
  errors,
  shopifyCustomerCache
}) {
  const email = row.Email?.toLowerCase().trim();
  if (!email) return;

  if (!shopifyCustomerCache.has(email)) {
    const customerId =
      await resolveShopifyCustomerByEmail(email);
    shopifyCustomerCache.set(email, customerId);
  }

  if (!shopifyCustomerCache.get(email)) {
    errors.push({
      row: index + 1,
      field: "Email",
      code: "SHOPIFY_CUSTOMER_NOT_FOUND",
      message: "No Shopify customer exists with this email"
    });
  }
}
