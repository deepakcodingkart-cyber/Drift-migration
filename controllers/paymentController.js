import { getMigrationById } from "../db/services/migration.service.js";
import { revokePayments } from "../services/execution/revokePayments.service.js";

export async function revoke(req, res) {
  try {
    const { migration_id } = req.params;

    const migration = await getMigrationById(migration_id);
    if (!migration) {
      return res.status(404).json({
        success: false,
        message: "Migration not found"
      });
    }
    console.log("Starting revokePayments for migration:", migration);

    const result = await revokePayments(migration);

    return res.json({
      success: true,
      action: "revoke_payments",
      migration_id,
      result
    });

  } catch (err) {
    console.error("revokePayments error:", err);

    return res.status(500).json({
      success: false,
      message: "Payment revoke failed",
      error: err.message
    });
  }
}
