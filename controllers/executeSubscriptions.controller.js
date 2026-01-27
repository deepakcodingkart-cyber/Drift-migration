import { getMigrationById, updateMigration } from "../services/migration.service.js";
import { executeSubscriptions } from "../services/execution/executeSubscriptions.service.js";

/**
 * POST /migrations/:migration_id/execute-subscriptions
 *
 * - Validates migration
 * - Ensures correct state
 * - Executes subscription creation
 */
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
