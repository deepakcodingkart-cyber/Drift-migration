import { getJobClient } from "../db/jobClient.js";

export async function getPaymentRegistry({
  migration_id,
  provider,
  external_payment_id
}) {
  const client = await getJobClient();

  const res = await client.query(
    `
    SELECT *
    FROM migration_payment_registry
    WHERE migration_id = $1
      AND provider = $2
      AND external_payment_id = $3
    `,
    [migration_id, provider, external_payment_id]
  );

  return res.rows[0] || null;
}

export async function upsertPaymentRegistry({
  migration_id,
  provider,
  email,
  shopify_customer_id = null,
  external_payment_id,
  shopify_payment_method_id = null,
  status,
  error_message = null
}) {
  const client = await getJobClient();

  await client.query(
    `
    INSERT INTO migration_payment_registry (
      migration_id,
      provider,
      email,
      shopify_customer_id,
      external_payment_id,
      shopify_payment_method_id,
      status,
      error_message,
      created_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now())
    ON CONFLICT (migration_id, provider, external_payment_id)
    DO UPDATE SET
      shopify_customer_id = EXCLUDED.shopify_customer_id,
      shopify_payment_method_id = EXCLUDED.shopify_payment_method_id,
      status = EXCLUDED.status,
      error_message = EXCLUDED.error_message
    `,
    [
      migration_id,
      provider,
      email,
      shopify_customer_id,
      external_payment_id,
      shopify_payment_method_id,
      status,
      error_message
    ]
  );
}

export async function getPaymentRegistryByEmail({
  migration_id,
  email
}) {
  if (!migration_id || !email) {
    throw new Error(
      "getPaymentRegistryByEmail: migration_id and email are required"
    );
  }

  const client = await getJobClient();

  const res = await client.query(
    `
    SELECT
      id,
      migration_id,
      provider,
      email,
      shopify_customer_id,
      external_payment_id,
      shopify_payment_method_id,
      status,
      error_message,
      created_at
    FROM migration_payment_registry
    WHERE migration_id = $1
      AND email = $2
      AND status = 'success'
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [
      migration_id,
      email.toLowerCase().trim()
    ]
  );

  return res.rows[0] || null;
}

export async function getSuccessfulPaymentsByMigration({
  migration_id
}) {
  const client = await getJobClient();

  const res = await client.query(
    `
    SELECT
      migration_id,
      provider,
      shopify_payment_method_id
    FROM migration_payment_registry
    WHERE migration_id = $1
      AND status = 'success'
      AND shopify_payment_method_id IS NOT NULL
    `,
    [migration_id]
  );

  return res.rows;
}

/**
 * Update payment status after revoke
 */
export async function updatePaymentStatusByShopifyMethod({
  migration_id,
  shopify_payment_method_id,
  status,
  error_message = null
}) {
  const client = await getJobClient();

  await client.query(
    `
    UPDATE migration_payment_registry
    SET
      status = $1,
      error_message = $2
    WHERE migration_id = $3
      AND shopify_payment_method_id = $4
    `,
    [
      status,
      error_message,
      migration_id,
      shopify_payment_method_id
    ]
  );
}
