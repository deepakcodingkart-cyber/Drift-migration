import { getMigrationById, updateMigration } from "../services/migration.service.js";
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
