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

/**
 * Get all active (uploaded) files for a migration
 * - Returns array of { file_type, file_name, file_path, status }
 */
export async function getMigrationFiles(migrationId) {
  if (!migrationId) {
    throw new Error("getMigrationFiles: migrationId is required");
  }

  const client = await getJobClient();

  const res = await client.query(
    `
    SELECT
      file_type,
      file_name,
      file_path,
      status,
      created_at
    FROM migration_files
    WHERE migration_id = $1
      AND status = 'uploaded'
    ORDER BY created_at ASC
    `,
    [migrationId]
  );

  return res.rows; // [] if none
}

/**
 * Update status of a migration file
 * Used after dry-run per file
 *
 * status allowed:
 * - uploaded
 * - dry_run_failed
 * - ready_for_execution
 * - replaced
 */
export async function updateMigrationFileStatus({
  migration_id,
  file_type,
  status
}) {
  if (!migration_id || !file_type || !status) {
    throw new Error(
      "updateMigrationFileStatus: migration_id, file_type and status are required"
    );
  }

  const ALLOWED_STATUS = [
    "uploaded",
    "dry_run_failed",
    "ready_for_execution",
    "replaced"
  ];

  if (!ALLOWED_STATUS.includes(status)) {
    throw new Error(
      `updateMigrationFileStatus: invalid status "${status}"`
    );
  }

  const client = await getJobClient();

  const res = await client.query(
    `
    UPDATE migration_files
    SET status = $1
    WHERE migration_id = $2
      AND file_type = $3
    RETURNING *
    `,
    [status, migration_id, file_type]
  );

  if (res.rowCount === 0) {
    throw new Error(
      `updateMigrationFileStatus: file not found for type "${file_type}"`
    );
  }

  return res.rows[0];
}