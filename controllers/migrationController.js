import { createMigration, getMigrationById, updateMigration } from "../services/migration.service.js";
import { getMigrationFiles } from "../services/migrationFiles.service.js";
import { runDryRun } from "../services/dryRunService.js";
import { executePayments } from "../services/execution/executePayments.service.js";
import { executeSubscriptions } from "../services/execution/executeSubscriptions.service.js";

/**
 * POST /migrations/:migration_id/dry-run
 *
 * - validates migration
 * - moves status to dry_run_pending
 * - runs dry run on all uploaded CSV files
 */
export async function dryRunController(req, res) {
  try {
    const { migration_id } = req.params;
    const { shop_id } = req.body;

    if (!migration_id) {
      return res.status(400).json({
        success: false,
        message: "migration_id is required"
      });
    }

    const migration = await getMigrationById(migration_id);
    console.log("Fetched migration:", migration);

    if (!migration) {
      return res.status(404).json({
        success: false,
        message: "Migration not found"
      });
    }

    // 🔐 multi-tenant safety
    if (shop_id && migration.shop_id !== shop_id) {
      return res.status(403).json({
        success: false,
        message: "Migration does not belong to this shop"
      });
    }

    // 🔁 status guard
    if (migration.status !== "uploaded") {
      return res.status(400).json({
        success: false,
        message: `Dry run not allowed when status = ${migration.status}`
      });
    }

    // 🔄 move to pending
    await updateMigration(migration.id, {
      status: "dry_run_pending"
    });

    // 🚀 run dry run (async-safe, streaming)
    await runDryRun(migration);

      const files = await getMigrationFiles(migration.id);

    const hasErrors = files.some(
      f => f.dry_run_status === "failed"
    );

    return res.json({
      success: true,
      migration_id: migration.id,
      status: hasErrors ? "dry_run_failed" : "ready_for_execution",
      files: files.map(f => ({
        file_type: f.file_type,
        dry_run_status: f.dry_run_status,
        dry_run_report_path: f.dry_run_report_path
      }))
    });

  } catch (err) {
    console.error("dryRunController error:", err);
    return res.status(500).json({
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
      title,
      created_by
    } = req.body;

    if (!shop_id || !shop_domain || !title) {
      return res.status(400).json({
        success: false,
        message: "shop_id, shop_domain and title are required"
      });
    }

    const migration = await createMigration({
      shop_id,
      shop_domain,
      title,
      created_by
    });

    return res.json({
      success: true,
      migration_id: migration.id,
      status: migration.status
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

export async function executePaymentsController(req, res) {
  try {
    const { migration_id } = req.params;

    if (!migration_id) {
      return res.status(400).json({
        success: false,
        message: "migration_id is required"
      });
    }
    console.log("migration_id:", migration_id);

    const migration = await getMigrationById(migration_id);
    console.log("migration:", migration);

    if (!migration) {
      return res.status(404).json({
        success: false,
        message: "Migration not found"
      });
    }

    if (!["completed", "completed_with_errors"].includes(migration.status)) {
      return res.status(400).json({
        success: false,
        message: `Payment execution not allowed in status ${migration.status}`
      });
    }
    console.log("migration.status:", migration.status);

    await executePayments(migration);

    return res.json({
      success: true,
      migration_id,
      message: "Payment execution completed"
    });

  } catch (err) {
    console.error("executePaymentsController error:", err);
    return res.status(500).json({
      success: false,
      message: "Payment execution failed",
      error: err.message
    });
  }
}

export async function executeSubscriptionsController(req, res) {
  try {
    const { migration_id } = req.params;
    const { shop_id } = req.body;
    console.log("Executing subscriptions for migration:", migration_id);
    console.log("Shop ID:", shop_id);

    if (!migration_id) {
      return res.status(400).json({
        success: false,
        message: "migration_id is required"
      });
    }

    const migration = await getMigrationById(migration_id);
    console.log("Migration in controller:", migration);

    if (!migration) {
      return res.status(404).json({
        success: false,
        message: "Migration not found"
      });
    }

    // 🔐 Multi-tenant safety
    if (shop_id && migration.shop_id !== shop_id) {
      return res.status(403).json({
        success: false,
        message: "Migration does not belong to this shop"
      });
    }
    console.log("Shop ID matches");

    // 🔒 Status guard
    if (!["completed", "completed_with_errors", "payments_executed"].includes(migration.status)) {
      return res.status(400).json({
        success: false,
        message: `Subscription execution not allowed in status ${migration.status}`
      });
    }

    // 🚀 Execute subscriptions
    await executeSubscriptions(migration);

    // 🔑 IMPORTANT:
    // Migration status NOT changed here
    // because:
    // - payment + subscription both may exist
    // - file-level status already tracked

    return res.json({
      success: true,
      migration_id,
      message: "Subscription execution completed"
    });

  } catch (err) {
    console.error("executeSubscriptionsController error:", err);
    return res.status(500).json({
      success: false,
      message: "Subscription execution failed",
      error: err.message
    });
  }
}

