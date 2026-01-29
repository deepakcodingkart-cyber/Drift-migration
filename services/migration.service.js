import sequelize from "../db/sequelize.js";
import { QueryTypes } from "sequelize";

/* ================================
   CREATE MIGRATION (ONCE)
================================ */
/**
 * CREATE MIGRATION (NO FILES HERE)
 */
export async function createMigration({
  shop_id,
  shop_domain,
  title,
  created_by
}) {
  const [rows] = await sequelize.query(
    `
    INSERT INTO migrations (
      shop_id,
      shop_domain,
      title,
      status,
      created_by,
      created_at,
      updated_at
    )
    VALUES (
      :shop_id,
      :shop_domain,
      :title,
      'created',
      :created_by,
      NOW(),
      NOW()
    )
    RETURNING *
    `,
    {
      replacements: {
        shop_id,
        shop_domain,
        title,
        created_by
      },
      type: QueryTypes.INSERT
    }
  );

  return rows[0];
}

/* ================================
   GET MIGRATION BY ID
================================ */
export async function getMigrationById(migration_id) {
  const rows = await sequelize.query(
    `
    SELECT *
    FROM migrations
    WHERE id = :migration_id
    `,
    {
      replacements: { migration_id },
      type: QueryTypes.SELECT
    }
  );

  return rows[0] || null;
}

/* ================================
   UPDATE MIGRATION
================================ */
export async function updateMigration(migrationId, updates) {
  if (!migrationId) {
    throw new Error("updateMigration: migrationId is required");
  }

  if (!updates || Object.keys(updates).length === 0) {
    throw new Error("updateMigration: updates are required");
  }

  // ✅ allow only safe columns
  const ALLOWED_FIELDS = ["status"];

  const setClauses = [];
  const replacements = { migrationId };

  for (const key of Object.keys(updates)) {
    if (!ALLOWED_FIELDS.includes(key)) {
      throw new Error(`updateMigration: invalid field "${key}"`);
    }

    setClauses.push(`${key} = :${key}`);
    replacements[key] = updates[key];
  }

  const query = `
    UPDATE migrations
    SET ${setClauses.join(", ")},
        updated_at = NOW()
    WHERE id = :migrationId
    RETURNING *
  `;

  const [rows] = await sequelize.query(query, {
    replacements,
    type: QueryTypes.UPDATE
  });

  if (!rows.length) {
    throw new Error("updateMigration: migration not found");
  }

  return rows[0];
}
