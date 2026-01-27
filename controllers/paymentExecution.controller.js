import { getMigrationById } from "../services/migration.service.js";
import { executePayments } from "../services/execution/executePayments.service.js";

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
