import { getJobClient } from "../db/jobClient.js";

/* =========================================
   UPSERT FILE FOR A MIGRATION
========================================= */
export async function upsertMigrationFile({
  migration_id,
  migration_type,
  file_type,
  file_name,
  file_path
}) {
  const client = await getJobClient();

  await client.query("BEGIN");

  await client.query(
    `
    DELETE FROM migration_files
    WHERE migration_id = $1
      AND file_type = $2
    `,
    [migration_id, file_type]
  );

  await client.query(
    `
    INSERT INTO migration_files (
      migration_id,
      migration_type,
      file_type,
      file_name,
      file_path,
      dry_run_status,
      execution_status,
      created_at,
      updated_at
    )
    VALUES (
      $1, $2, $3, $4, $5,
      'pending',
      'pending',
      NOW(),
      NOW()
    )
    `,
    [
      migration_id,
      migration_type,
      file_type,
      file_name,
      file_path
    ]
  );

  await client.query("COMMIT");
}

// export async function getMigrationFiles(migrationId) {
//   if (!migrationId) {
//     throw new Error("getMigrationFiles: migrationId is required");
//   }

//   const client = await getJobClient();

//   const res = await client.query(
//     `
//     SELECT
//       id,
//       migration_id,
//       migration_type,
//       file_type,
//       file_name,
//       file_path,
//       dry_run_status,
//       execution_status,
//       dry_run_report_path,
//       created_at,
//       updated_at
//     FROM migration_files
//     WHERE migration_id = $1
//     ORDER BY created_at ASC
//     `,
//     [migrationId]
//   );

//   return res.rows;
// }

export async function getMigrationFiles(
  migrationId,
  { dry_run_status } = {}
) {
  if (!migrationId) {
    throw new Error("getMigrationFiles: migrationId is required");
  }

  const client = await getJobClient();

  let query = `
    SELECT
      id,
      migration_id,
      migration_type,
      file_type,
      file_name,
      file_path,
      dry_run_status,
      execution_status,
      dry_run_report_path,
      created_at,
      updated_at
    FROM migration_files
    WHERE migration_id = $1
  `;

  const values = [migrationId];

  if (dry_run_status) {
    query += ` AND dry_run_status = $2`;
    values.push(dry_run_status);
  }

  query += ` ORDER BY created_at ASC`;

  const res = await client.query(query, values);
  return res.rows;
}

export async function updateMigrationFileStatus({
  migration_id,
  file_type,
  dry_run_status,
  dry_run_report_path = null
}) {
  if (!migration_id || !file_type || !dry_run_status) {
    throw new Error(
      "updateMigrationFileStatus: migration_id, file_type, dry_run_status required"
    );
  }

  const ALLOWED_STATUS = [
    "pending",
    "running",
    "failed",
    "passed"
  ];

  if (!ALLOWED_STATUS.includes(dry_run_status)) {
    throw new Error(
      `Invalid dry_run_status: ${dry_run_status}`
    );
  }

  const client = await getJobClient();

  const res = await client.query(
    `
    UPDATE migration_files
    SET
      dry_run_status = $1,
      dry_run_report_path = COALESCE($2, dry_run_report_path),
      updated_at = NOW()
    WHERE migration_id = $3
      AND file_type = $4
    RETURNING *
    `,
    [
      dry_run_status,
      dry_run_report_path,
      migration_id,
      file_type
    ]
  );

  if (res.rowCount === 0) {
    throw new Error(
      `No migration file found for ${file_type}`
    );
  }

  return res.rows[0];
}

/**
 * 🔥 Updates execution status of a SINGLE migration file
 *
 * execution_status:
 * - pending   (default)
 * - completed (all rows success)
 * - partial   (some success, some failed)
 * - failed    (all rows failed)
 *
 * IMPORTANT:
 * - This is FILE-LEVEL summary
 * - Row-level state is stored elsewhere
 */
export async function updateMigrationFileExecutionStatus({
  migration_id,
  file_type,
  execution_status
}) {
  if (!migration_id || !file_type || !execution_status) {
    throw new Error(
      "updateMigrationFileExecutionStatus: migration_id, file_type and execution_status are required"
    );
  }

  const ALLOWED_STATUS = ["pending", "completed", "partial", "failed"];

  if (!ALLOWED_STATUS.includes(execution_status)) {
    throw new Error(
      `Invalid execution_status: ${execution_status}`
    );
  }

  const client = await getJobClient();

  const res = await client.query(
    `
    UPDATE migration_files
    SET
      execution_status = $1,
      updated_at = NOW()
    WHERE migration_id = $2
      AND file_type = $3
    RETURNING *
    `,
    [execution_status, migration_id, file_type]
  );

  if (res.rowCount === 0) {
    throw new Error(
      `No migration file found for migration_id=${migration_id}, file_type=${file_type}`
    );
  }

  return res.rows[0];
}