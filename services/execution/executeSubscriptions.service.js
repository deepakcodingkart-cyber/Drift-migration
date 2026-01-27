import {
  getMigrationFiles,
  updateMigrationFileExecutionStatus
} from "../migrationFiles.service.js";

import { parseFileFromPath } from "../../utils/fileParserFromPath.util.js";

import {
  getSubscriptionRegistry,
  upsertSubscriptionRegistry
} from "../subscriptionRegistry.service.js";

import { getPaymentRegistryByEmail } from "../paymentRegistry.service.js";
import { createSubscription } from "../shopify/createSubscription.js";

const SUBSCRIPTION_FILE_TYPE = "subscription_csv";

export async function executeSubscriptions(migration) {
  const migrationId = migration.id;

  const files = await getMigrationFiles(migrationId);

  const subscriptionFiles = files.filter(
    f =>
      f.file_type === SUBSCRIPTION_FILE_TYPE &&
      f.dry_run_status === "passed" &&
      (f.execution_status === "pending" || f.execution_status === "failed")
  );

  for (const file of subscriptionFiles) {
    let successCount = 0;
    let failureCount = 0;

    await parseFileFromPath(file.file_path, async (row) => {
      try {
        await executeSubscriptionRow({
          migration_id: migrationId,
          row
        });
        successCount++;
      } catch (err) {
        // should be rare (system error)
        console.error("Subscription row fatal error:", err.message);
        failureCount++;
      }
    });

    let execution_status = "completed";
    if (failureCount > 0 && successCount > 0) {
      execution_status = "partial";
    } else if (failureCount > 0 && successCount === 0) {
      execution_status = "failed";
    }

    await updateMigrationFileExecutionStatus({
      migration_id: migrationId,
      file_type: SUBSCRIPTION_FILE_TYPE,
      execution_status
    });
  }
}

/**
 * Execute a single subscription row
 */
async function executeSubscriptionRow({ migration_id, row }) {
  if (!row.Email) {
    throw new Error("Email is required");
  }

  if (!row.External_Subscription_ID) {
    throw new Error("External_Subscription_ID is required");
  }

  const email = row.Email.toLowerCase().trim();
  const external_subscription_id = row.External_Subscription_ID;

  /* =====================================================
     1️⃣ IDEMPOTENCY CHECK
  ===================================================== */
  const existing = await getSubscriptionRegistry({
    migration_id,
    external_subscription_id
  });

  if (existing && existing.status === "created") {
    return; // already created
  }

  /* =====================================================
     2️⃣ PAYMENT PREREQUISITE
  ===================================================== */
  const payment = await getPaymentRegistryByEmail({
    migration_id,
    email
  });

  if (!payment || payment.status !== "success") {
    await upsertSubscriptionRegistry({
      migration_id,
      external_subscription_id,
      status: "failed",
      error_message: "Missing or failed payment method"
    });
    return;
  }

  const shopifyCustomerId = payment.shopify_customer_id;
  const paymentMethodId = payment.shopify_payment_method_id;

  if (!shopifyCustomerId || !paymentMethodId) {
    await upsertSubscriptionRegistry({
      migration_id,
      external_subscription_id,
      status: "failed",
      error_message: "Missing Shopify customer or payment method"
    });
    return;
  }

  /* =====================================================
     3️⃣ CREATE SHOPIFY SUBSCRIPTION
  ===================================================== */
  try {
    const shopifySubscriptionId = await createSubscription({
      customerId: shopifyCustomerId,
      paymentMethodId,
      row
    });

    await upsertSubscriptionRegistry({
      migration_id,
      external_subscription_id,
      shopify_subscription_id: shopifySubscriptionId,
      status: "created"
    });

    return;

  } catch (err) {
    await upsertSubscriptionRegistry({
      migration_id,
      external_subscription_id,
      status: "failed",
      error_message: err.message
    });

    return;
  }
}
