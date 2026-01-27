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