import { getJobClient } from "../db/jobClient.js";

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
