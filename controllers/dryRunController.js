import { createMigration, getMigrationById, updateMigration } from "../services/migration.service.js";
import { runDryRun } from "../services/dryRunService.js";

export async function dryRunController(req, res) {
  try {
    const { migration_id } = req.params;
    const { shop_id } = req.body;

    const migration = await getMigrationById(migration_id);

    if (!migration || migration.shop_id !== shop_id) {
      return res.status(404).json({
        success: false,
        message: "Migration not found"
      });
    }

    if (migration.status !== "uploaded") {
      return res.status(400).json({
        success: false,
        message: `Dry run not allowed in status ${migration.status}`
      });
    }
    await updateMigration(migration_id, {
      status: "dry_run_pending"
    });

    await runDryRun(migration);

    return res.json({
      success: true,
      message: "Dry run completed"
    });

  } catch (err) {
    console.error("dryRunController error:", err);
    res.status(500).json({
      success: false,
      message: "Dry run failed",
      error: err.message
    });
  }
}

export async function createMigrationController(req, res) {
  try {
    const {
      shop_id,
      shop_domain,
      migration_type,
      created_by
    } = req.body;

    if (!shop_id || !shop_domain || !migration_type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const migration = await createMigration({
      shop_id,
      shop_domain,
      migration_type,
      created_by
    });

    return res.json({
      success: true,
      migration_id: migration.id
    });

  } catch (err) {
    console.error("createMigrationController error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create migration",
      error: err.message
    });
  }
}
