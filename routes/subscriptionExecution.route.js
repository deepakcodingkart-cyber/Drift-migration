import express from "express";
import { executeSubscriptionsController } from "../controllers/executeSubscriptions.controller.js";

const router = express.Router();

/**
 * Execute Subscription Creation
 * Uses already uploaded + validated subscription CSV
 */
export default function () {
  router.post(
    "/:migration_id",
    executeSubscriptionsController
  );

  return router;
}
