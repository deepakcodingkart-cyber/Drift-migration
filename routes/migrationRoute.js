import express from "express";
import { createMigrationController, dryRunController } from "../controllers/dryRunController.js";

const router = express.Router();

/**
 * DRY RUN (Module 2)
 * No file upload
 * Uses already uploaded CSV via migration_id
 */

export default function () {
  router.post("/:migration_id/dry-run", dryRunController);
  router.post("/create", createMigrationController);

  return router;
}