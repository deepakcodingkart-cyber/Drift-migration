import sequelize from "../db/sequelize.js";
import { QueryTypes } from "sequelize";

/* =========================================
   GET EXISTING SUBSCRIPTION REGISTRY
========================================= */
export async function getSubscriptionRegistry({
  migration_id,
  external_subscription_id
}) {
  const rows = await sequelize.query(
    `
    SELECT *
    FROM migration_subscriptions
    WHERE migration_id = :migration_id
      AND external_subscription_id = :external_subscription_id
    `,
    {
      replacements: {
        migration_id,
        external_subscription_id
      },
      type: QueryTypes.SELECT
    }
  );

  return rows[0] || null;
}

/* =========================================
   UPSERT SUBSCRIPTION EXECUTION RESULT
========================================= */
export async function upsertSubscriptionRegistry({
  migration_id,
  external_subscription_id,
  shopify_subscription_id = null,
  status,
  error_message = null
}) {
  await sequelize.query(
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
    VALUES (
      :migration_id,
      :external_subscription_id,
      :shopify_subscription_id,
      :status,
      :error_message,
      NOW(),
      NOW()
    )
    ON CONFLICT (migration_id, external_subscription_id)
    DO UPDATE SET
      shopify_subscription_id = EXCLUDED.shopify_subscription_id,
      status = EXCLUDED.status,
      error_message = EXCLUDED.error_message,
      updated_at = NOW()
    `,
    {
      replacements: {
        migration_id,
        external_subscription_id,
        shopify_subscription_id,
        status,
        error_message
      },
      type: QueryTypes.INSERT
    }
  );
}

/* =========================================
   GET SUBSCRIPTIONS BY STATUS (BATCH)
========================================= */
export async function getSubscriptionsByMigrationAndStatus({
  migration_id,
  statuses
}) {
  if (!migration_id || !Array.isArray(statuses) || statuses.length === 0) {
    throw new Error(
      "getSubscriptionsByMigrationAndStatus: migration_id and statuses[] required"
    );
  }

  const rows = await sequelize.query(
    `
    SELECT
      migration_id,
      external_subscription_id,
      shopify_subscription_id,
      status
    FROM migration_subscriptions
    WHERE migration_id = :migration_id
      AND status = ANY(:statuses)
    ORDER BY created_at ASC
    `,
    {
      replacements: {
        migration_id,
        statuses
      },
      type: QueryTypes.SELECT
    }
  );

  return rows;
}

/* =========================================
   UPDATE SUBSCRIPTION STATUS
========================================= */
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

  await sequelize.query(
    `
    UPDATE migration_subscriptions
    SET
      status = :status,
      error_message = :error_message,
      updated_at = NOW()
    WHERE migration_id = :migration_id
      AND external_subscription_id = :external_subscription_id
    `,
    {
      replacements: {
        status,
        error_message,
        migration_id,
        external_subscription_id
      },
      type: QueryTypes.UPDATE
    }
  );
}
