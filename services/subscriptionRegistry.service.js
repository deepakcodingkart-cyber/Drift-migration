import { getJobClient } from "../db/jobClient.js";

/**
 * Get existing subscription by external_subscription_id
 */
export async function getSubscriptionRegistry({
  migration_id,
  external_subscription_id
}) {
  const client = await getJobClient();

  const res = await client.query(
    `
    SELECT *
    FROM migration_subscriptions
    WHERE migration_id = $1
      AND external_subscription_id = $2
    `,
    [migration_id, external_subscription_id]
  );

  return res.rows[0] || null;
}

/**
 * Insert / update subscription execution result
 */
export async function upsertSubscriptionRegistry({
  migration_id,
  external_subscription_id,
  shopify_subscription_id = null,
  status,
  error_message = null
}) {
  const client = await getJobClient();

  await client.query(
    `
    INSERT INTO migration_subscriptions (
      migration_id,
      external_subscription_id,
      shopify_subscription_id,
      status,
      error_message,
      created_at,
      updated_at
    )
    VALUES ($1,$2,$3,$4,$5,now(),now())
    ON CONFLICT (migration_id, external_subscription_id)
    DO UPDATE SET
      shopify_subscription_id = EXCLUDED.shopify_subscription_id,
      status = EXCLUDED.status,
      error_message = EXCLUDED.error_message,
      updated_at = now()
    `,
    [
      migration_id,
      external_subscription_id,
      shopify_subscription_id,
      status,
      error_message
    ]
  );
}

export async function getSubscriptionsByMigrationAndStatus({
  migration_id,
  statuses
}) {
  if (!migration_id || !Array.isArray(statuses) || statuses.length === 0) {
    throw new Error(
      "getSubscriptionsByMigrationAndStatus: migration_id and statuses[] required"
    );
  }

  const client = await getJobClient();

  const res = await client.query(
    `
    SELECT
      migration_id,
      external_subscription_id,
      shopify_subscription_id,
      status
    FROM migration_subscriptions
    WHERE migration_id = $1
      AND status = ANY($2)
    ORDER BY created_at ASC
    `,
    [
      migration_id,
      statuses
    ]
  );

  return res.rows;
}

/**
 * Update subscription status (used in activation / pause / cancel)
 */
export async function updateSubscriptionStatus({
  migration_id,
  external_subscription_id,
  status,
  error_message = null
}) {
  if (!migration_id || !external_subscription_id || !status) {
    throw new Error(
      "updateSubscriptionStatus: migration_id, external_subscription_id, status required"
    );
  }

  const client = await getJobClient();

  await client.query(
    `
    UPDATE migration_subscriptions
    SET
      status = $1,
      error_message = $2,
      updated_at = now()
    WHERE migration_id = $3
      AND external_subscription_id = $4
    `,
    [
      status,
      error_message,
      migration_id,
      external_subscription_id
    ]
  );
}
