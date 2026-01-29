import sequelize from "../db/sequelize.js";
import { QueryTypes } from "sequelize";

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
  if (!migration_id || !migration_type || !file_type) {
    throw new Error("upsertMigrationFile: required fields missing");
  }

  const transaction = await sequelize.transaction();

  try {
    await sequelize.query(
      `
      DELETE FROM migration_files
      WHERE migration_id = :migration_id
        AND file_type = :file_type
      `,
      {
        replacements: { migration_id, file_type },
        transaction
      }
    );

    const [rows] = await sequelize.query(
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
        :migration_id,
        :migration_type,
        :file_type,
        :file_name,
        :file_path,
        'pending',
        'pending',
        NOW(),
        NOW()
      )
      RETURNING *
      `,
      {
        replacements: {
          migration_id,
          migration_type,
          file_type,
          file_name,
          file_path
        },
        type: QueryTypes.INSERT,
        transaction
      }
    );

    await transaction.commit();
    return rows[0];

  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

/* =========================================
   GET MIGRATION FILES
========================================= */
export async function getMigrationFiles(
  migrationId,
  { dry_run_status } = {}
) {
  if (!migrationId) {
    throw new Error("getMigrationFiles: migrationId is required");
  }

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
    WHERE migration_id = :migration_id
  `;

  const replacements = { migration_id: migrationId };

  if (dry_run_status) {
    query += ` AND dry_run_status = :dry_run_status`;
    replacements.dry_run_status = dry_run_status;
  }

  query += ` ORDER BY created_at ASC`;

  const rows = await sequelize.query(query, {
    replacements,
    type: QueryTypes.SELECT
  });

  return rows;
}

/* =========================================
   UPDATE DRY RUN STATUS
========================================= */
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

  const ALLOWED_STATUS = ["pending", "running", "failed", "passed"];
  if (!ALLOWED_STATUS.includes(dry_run_status)) {
    throw new Error(`Invalid dry_run_status: ${dry_run_status}`);
  }

  const [rows] = await sequelize.query(
    `
    UPDATE migration_files
    SET
      dry_run_status = :dry_run_status,
      dry_run_report_path = COALESCE(:dry_run_report_path, dry_run_report_path),
      updated_at = NOW()
    WHERE migration_id = :migration_id
      AND file_type = :file_type
    RETURNING *
    `,
    {
      replacements: {
        dry_run_status,
        dry_run_report_path,
        migration_id,
        file_type
      },
      type: QueryTypes.UPDATE
    }
  );

  if (!rows.length) {
    throw new Error(`No migration file found for ${file_type}`);
  }

  return rows[0];
}

/* =========================================
   UPDATE EXECUTION STATUS (FILE LEVEL)
========================================= */
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
    throw new Error(`Invalid execution_status: ${execution_status}`);
  }

  const [rows] = await sequelize.query(
    `
    UPDATE migration_files
    SET
      execution_status = :execution_status,
      updated_at = NOW()
    WHERE migration_id = :migration_id
      AND file_type = :file_type
    RETURNING *
    `,
    {
      replacements: {
        execution_status,
        migration_id,
        file_type
      },
      type: QueryTypes.UPDATE
    }
  );

  if (!rows.length) {
    throw new Error(
      `No migration file found for migration_id=${migration_id}, file_type=${file_type}`
    );
  }

  return rows[0];
}
