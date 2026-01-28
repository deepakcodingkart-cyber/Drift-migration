import express from "express";
import { createMigrationController, dryRunController, executePaymentsController, executeSubscriptionsController } from "../controllers/migrationController.js";


const router = express.Router();

/**
 * DRY RUN (Module 2)
 * No file upload
 * Uses already uploaded CSV via migration_id
 */

export default function () {
  router.post("/create", createMigrationController);
  router.post("/:migration_id/dry-run", dryRunController);
  router.post("/:migration_id/payment-execute", executePaymentsController); // Placeholder for execute controller
  router.post("/:migration_id/subscription-execute", executeSubscriptionsController); // Placeholder for execute controller

  return router;
}