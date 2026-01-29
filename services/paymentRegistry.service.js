import sequelize from "../db/sequelize.js";
import { QueryTypes } from "sequelize";

/* =========================================
   GET PAYMENT REGISTRY (BY UNIQUE KEY)
========================================= */
export async function getPaymentRegistry({
  migration_id,
  provider,
  external_payment_id
}) {
  const rows = await sequelize.query(
    `
    SELECT *
    FROM migration_payment_registry
    WHERE migration_id = :migration_id
      AND provider = :provider
      AND external_payment_id = :external_payment_id
    `,
    {
      replacements: {
        migration_id,
        provider,
        external_payment_id
      },
      type: QueryTypes.SELECT
    }
  );

  return rows[0] || null;
}

/* =========================================
   UPSERT PAYMENT REGISTRY
========================================= */
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
  await sequelize.query(
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
    VALUES (
      :migration_id,
      :provider,
      :email,
      :shopify_customer_id,
      :external_payment_id,
      :shopify_payment_method_id,
      :status,
      :error_message,
      NOW()
    )
    ON CONFLICT (migration_id, provider, external_payment_id)
    DO UPDATE SET
      shopify_customer_id = EXCLUDED.shopify_customer_id,
      shopify_payment_method_id = EXCLUDED.shopify_payment_method_id,
      status = EXCLUDED.status,
      error_message = EXCLUDED.error_message
    `,
    {
      replacements: {
        migration_id,
        provider,
        email,
        shopify_customer_id,
        external_payment_id,
        shopify_payment_method_id,
        status,
        error_message
      },
      type: QueryTypes.INSERT
    }
  );
}

/* =========================================
   GET PAYMENT REGISTRY BY EMAIL (SUCCESS)
========================================= */
export async function getPaymentRegistryByEmail({
  migration_id,
  email
}) {
  if (!migration_id || !email) {
    throw new Error(
      "getPaymentRegistryByEmail: migration_id and email are required"
    );
  }

  const rows = await sequelize.query(
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
    WHERE migration_id = :migration_id
      AND email = :email
      AND status = 'success'
    ORDER BY created_at DESC
    LIMIT 1
    `,
    {
      replacements: {
        migration_id,
        email: email.toLowerCase().trim()
      },
      type: QueryTypes.SELECT
    }
  );

  return rows[0] || null;
}

/* =========================================
   GET ALL SUCCESSFUL PAYMENTS (MIGRATION)
========================================= */
export async function getSuccessfulPaymentsByMigration({
  migration_id
}) {
  const rows = await sequelize.query(
    `
    SELECT
      migration_id,
      provider,
      shopify_payment_method_id
    FROM migration_payment_registry
    WHERE migration_id = :migration_id
      AND status = 'success'
      AND shopify_payment_method_id IS NOT NULL
    `,
    {
      replacements: { migration_id },
      type: QueryTypes.SELECT
    }
  );

  return rows;
}

/* =========================================
   UPDATE PAYMENT STATUS BY SHOPIFY METHOD
========================================= */
export async function updatePaymentStatusByShopifyMethod({
  migration_id,
  shopify_payment_method_id,
  status,
  error_message = null
}) {
  await sequelize.query(
    `
    UPDATE migration_payment_registry
    SET
      status = :status,
      error_message = :error_message
    WHERE migration_id = :migration_id
      AND shopify_payment_method_id = :shopify_payment_method_id
    `,
    {
      replacements: {
        status,
        error_message,
        migration_id,
        shopify_payment_method_id
      },
      type: QueryTypes.UPDATE
    }
  );
}
