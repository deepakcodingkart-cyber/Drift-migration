import { getJobClient } from "../db/jobClient.js";

/* ================================
   CREATE MIGRATION (ONCE)
================================ */
export async function createMigration({
  shop_id,
  shop_domain,
  migration_type,
  created_by
}) {
  const client = await getJobClient();

  const res = await client.query(
    `
    INSERT INTO migrations (
      shop_id,
      shop_domain,
      migration_type,
      status,
      created_by
    )
    VALUES ($1, $2, $3, 'uploaded', $4)
    RETURNING *
    `,
    [shop_id, shop_domain, migration_type, created_by]
  );

  return res.rows[0];
}

/* ================================
   UPDATE MIGRATION
================================ */
export async function updateMigration(migrationId, updates) {
  if (!migrationId || !updates || Object.keys(updates).length === 0) {
    throw new Error("updateMigration: invalid arguments");
  }

  const client = await getJobClient();

  const fields = [];
  const values = [];
  let index = 1;

  for (const key of Object.keys(updates)) {
    fields.push(`${key} = $${index++}`);
    values.push(updates[key]);
  }

  values.push(migrationId);

  const query = `
    UPDATE migrationsapp
    SET ${fields.join(", ")},
        updated_at = NOW()
    WHERE id = $${index}
    RETURNING *
  `;

  const result = await client.query(query, values);
  return result.rows[0];
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
