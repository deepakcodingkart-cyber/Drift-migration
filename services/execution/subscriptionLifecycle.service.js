import {
  getSubscriptionsByMigrationAndStatus,
  updateSubscriptionStatus
} from "../../db/services/subscriptionRegistry.service.js";

import { activateSubscription } from "../shopify/activateSubscription.js";
import { pauseSubscription } from "../shopify/pauseSubscription.js";
import { cancelSubscription } from "../shopify/cancelSubscription.js";


/* ===========================
   ACTIVATE
=========================== */
export async function activateSubscriptions(migration) {
  return run(migration, {
    from: ["created", "paused"],
    to: "activated",
    action: activateSubscription
  });
}

/* ===========================
   PAUSE
=========================== */
export async function pauseSubscriptions(migration) {
  return run(migration, {
    from: ["activated"],
    to: "paused",
    action: pauseSubscription
  });
}

/* ===========================
   CANCEL
=========================== */
export async function cancelSubscriptions(migration) {
  return run(migration, {
    from: ["activated", "paused"],
    to: "cancelled",
    action: cancelSubscription
  });
}

/* ===========================
   CORE RUNNER
=========================== */
async function run(migration, config) {
  const subs = await getSubscriptionsByMigrationAndStatus({
    migration_id: migration.id,
    statuses: config.from
  });

  let success = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      await config.action(sub.shopify_subscription_id);

      await updateSubscriptionStatus({
        migration_id: migration.id,
        external_subscription_id: sub.external_subscription_id,
        status: config.to
      });

      success++;
    } catch (err) {
      await updateSubscriptionStatus({
        migration_id: migration.id,
        external_subscription_id: sub.external_subscription_id,
        status: "failed",
        error_message: err.message
      });
      failed++;
    }
  }

  return {
    total: subs.length,
    success,
    failed
  };
}
