import { getMigrationById } from "../db/services/migration.service.js";
import {
  activateSubscriptions,
  pauseSubscriptions,
  cancelSubscriptions
} from "../services/execution/subscriptionLifecycle.service.js";

export async function activate(req, res) {
  return handle(req, res, "activate");
}

export async function pause(req, res) {
  return handle(req, res, "pause");
}

export async function cancel(req, res) {
  return handle(req, res, "cancel");
}

async function handle(req, res, action) {
  try {
    const { migration_id } = req.params;

    const migration = await getMigrationById(migration_id);
    if (!migration) {
      return res.status(404).json({
        success: false,
        message: "Migration not found"
      });
    }

    let result;
    if (action === "activate") {
      result = await activateSubscriptions(migration);
    } else if (action === "pause") {
      result = await pauseSubscriptions(migration);
    } else if (action === "cancel") {
      result = await cancelSubscriptions(migration);
    }

    return res.json({
      success: true,
      action,
      migration_id,
      result
    });

  } catch (err) {
    console.error("Subscription lifecycle error:", err);
    return res.status(500).json({
      success: false,
      message: "Subscription lifecycle failed",
      error: err.message
    });
  }
}
