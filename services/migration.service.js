import { getJobClient } from "../db/jobClient.js";

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
  const client = await getJobClient();

  const res = await client.query(
    `
    INSERT INTO migrations (
      shop_id,
      shop_domain,
      title,
      status,
      created_by
    )
    VALUES ($1, $2, $3, 'created', $4)
    RETURNING *
    `,
    [shop_id, shop_domain, title, created_by]
  );

  return res.rows[0];
}

/* ================================
   GET MIGRATION BY ID
================================ */
export async function getMigrationById(migration_id) {
  const client = await getJobClient();

  const res = await client.query(
    `
    SELECT *
    FROM migrations
    WHERE id = $1
    `,
    [migration_id]
  );

  return res.rows[0] || null;
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
  const ALLOWED_FIELDS = [
    "status"
  ];

  const fields = [];
  const values = [];
  let index = 1;

  for (const key of Object.keys(updates)) {
    if (!ALLOWED_FIELDS.includes(key)) {
      throw new Error(`updateMigration: invalid field "${key}"`);
    }

    fields.push(`${key} = $${index}`);
    values.push(updates[key]);
    index++;
  }

  values.push(migrationId);

  const query = `
    UPDATE migrations
    SET ${fields.join(", ")},
        updated_at = NOW()
    WHERE id = $${index}
    RETURNING *
  `;

  const client = await getJobClient();
  const result = await client.query(query, values);

  if (result.rowCount === 0) {
    throw new Error("updateMigration: migration not found");
  }

  return result.rows[0];
}


