import {
  getSuccessfulPaymentsByMigration,
  updatePaymentStatusByShopifyMethod
} from "../paymentRegistry.service.js";

import { revokePaymentMethod } from "../shopify/revokePaymentMethod.js";

/**
 * Revoke all Shopify payment methods created during migration
 */
export async function revokePayments(migration) {
    console.log("RevokePayments called with migration:", migration);
  const payments = await getSuccessfulPaymentsByMigration({
    migration_id: migration.id
  });
  console.log(`Found ${payments.length} successful payments for migration ID ${migration.id}, proceeding to revoke. Payments:`, payments);

  let success = 0;
  let failed = 0;

  for (const payment of payments) {
    try {
      await revokePaymentMethod(payment.shopify_payment_method_id);

      await updatePaymentStatusByShopifyMethod({
        migration_id: migration.id,
        shopify_payment_method_id: payment.shopify_payment_method_id,
        status: "revoked"
      });

      success++;

    } catch (err) {
      await updatePaymentStatusByShopifyMethod({
        migration_id: migration.id,
        shopify_payment_method_id: payment.shopify_payment_method_id,
        status: "failed",
        error_message: err.message
      });

      failed++;
    }
  }

  return {
    total: payments.length,
    success,
    failed
  };
}
