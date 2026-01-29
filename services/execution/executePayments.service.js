import { getMigrationFiles, updateMigrationFileExecutionStatus } from "../../db/services/migrationFiles.service.js";
import { parseFileFromPath } from "../../utils/fileParserFromPath.util.js";
import {
  getPaymentRegistry,
  upsertPaymentRegistry
} from "../../db/services/paymentRegistry.service.js";
import { createCustomerPaymentMethod } from "../shopify/createCustomerPaymentMethod.js";
import { buildRemotePaymentReference } from "../buildRemotePaymentReference.js";
import { resolveShopifyCustomerByEmail } from "../shopify/resolveShopifyCustomerByEmail.js";

const PAYMENT_FILE_TYPES = [
  "stripe_payment_csv",
  "paypal_payment_csv",
  "payment_braintree_csv",
  "authorizedotnet_payment_csv"
];

export async function executePayments(migration) {
  const migrationId = migration.id;
  console.log("migrationId", migrationId);

  const files = await getMigrationFiles(migrationId);
  console.log("files", files);

  const paymentFiles = files.filter(
    f =>
      PAYMENT_FILE_TYPES.includes(f.file_type) &&
      f.dry_run_status === "passed"
  );

  console.log("paymentFiles", paymentFiles);

  for (const file of paymentFiles) {
    let successCount = 0;
    let failureCount = 0;

    await parseFileFromPath(file.file_path, async (row) => {
      try {
        await executePaymentRow({
          migration_id: migrationId,
          file_type: file.file_type,
          row
        });
        successCount++;
        console.log("successCount", successCount);
      } catch (err) {
        console.error("Payment row failed:", err.message);
        failureCount++;
        console.log("failureCount", failureCount);
      }
    });
    console.log("successCount", successCount);
    console.log("failureCount", failureCount);

    let execution_status = "completed";
    if (failureCount > 0 && successCount > 0) {
      execution_status = "partial";
      console.log("partial");
    } else if (failureCount > 0 && successCount === 0) {
      execution_status = "failed";
      console.log("failed");
    }

    await updateMigrationFileExecutionStatus({
      migration_id: migrationId,
      file_type: file.file_type,
      execution_status
    });
  }
}

async function executePaymentRow({ migration_id, file_type, row }) {

  console.log("row", row);

  if (!row?.Email) {
    throw new Error("Email is required");
  }

  const email = row?.Email?.toLowerCase()?.trim();

  // 🔑 1️⃣ Resolve Shopify customer from EMAIL
  const { provider, external_payment_id, remoteReference } =
    buildRemotePaymentReference(file_type, row);

  console.log("provider", provider);
  console.log("external_payment_id", external_payment_id);
  console.log("remoteReference", remoteReference);

  if (!external_payment_id || !remoteReference) {
    throw new Error("Invalid payment credentials in row");
  }

  const shopifyCustomerId = await resolveShopifyCustomerByEmail(email);
  console.log("shopifyCustomerId", shopifyCustomerId);

  if (!shopifyCustomerId) {
    await upsertPaymentRegistry({
      migration_id,
      provider,
      email,
      shopify_customer_id: null,
      status: "failed",
      error_message: `Shopify customer not found for email: ${email}`
    });
    return;
  }

  // 🔁 Idempotency check
  const existing = await getPaymentRegistry({
    migration_id,
    provider,
    external_payment_id
  });
  console.log("existing", existing);

  if (existing && existing.status === "success") {
    return; // already executed
  }

  try {
    const shopifyPaymentMethodId =
      await createCustomerPaymentMethod(
        shopifyCustomerId,
        remoteReference
      );
    console.log("shopifyPaymentMethodId", shopifyPaymentMethodId);

    await upsertPaymentRegistry({
      migration_id,
      provider,
      email,
      shopify_customer_id: shopifyCustomerId,   // 🔥 SAVE HERE
      external_payment_id,
      shopify_payment_method_id: shopifyPaymentMethodId,
      status: "success"
    });


  } catch (err) {
    await upsertPaymentRegistry({
      migration_id,
      provider,
      email,
      shopify_customer_id: shopifyCustomerId,   // 🔥 STILL SAVE
      external_payment_id,
      status: "failed",
      error_message: err.message
    });

    throw err;
  }
}
