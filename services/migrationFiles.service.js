import { getJobClient } from "../db/jobClient.js";

/* =========================================
   UPSERT FILE FOR A MIGRATION
========================================= */
export async function upsertMigrationFile({
  migration_id,
  file_type,
  file_name,
  file_path
}) {
  console.log("Upserting migration file:", {
    migration_id,
    file_type,
    file_name,
    file_path
  });
  const client = await getJobClient();

  await client.query("BEGIN");

  // mark existing file of same type as replaced
  await client.query(
    `
    UPDATE migration_files
    SET status = 'replaced'
    WHERE migration_id = $1
      AND file_type = $2
    `,
    [migration_id, file_type]
  );

  // insert new file
  await client.query(
    `
    INSERT INTO migration_files (
      migration_id,
      file_type,
      file_name,
      file_path,
      status
    )
    VALUES ($1, $2, $3, $4, 'uploaded')
    `,
    [migration_id, file_type, file_name, file_path]
  );

  await client.query("COMMIT");
}
