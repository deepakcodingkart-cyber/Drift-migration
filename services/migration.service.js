import { getJobClient } from "../db/jobClient.js";

/* ================================
   CREATE MIGRATION
================================ */
export async function createMigration(data) {
  const client = await getJobClient();

  const res = await client.query(
    `
    INSERT INTO migrationsapp (
      shop_id,
      shop_domain,
      migration_type,
      file_type,
      file_path,
      status,
      created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [
      data.shop_id,
      data.shop_domain,
      data.migration_type,
      data.file_type,
      data.file_path,
      data.status,
      data.created_by
    ]
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

export async function getMigrationById(migrationId) {
  if (!migrationId) {
    throw new Error("getMigrationById: migrationId is required");
  }

  const client = await getJobClient();

  const res = await client.query(
    `
    SELECT *
    FROM migrationsapp
    WHERE id = $1
    LIMIT 1
    `,
    [migrationId]
  );

  return res.rows[0] || null;
}