import express from "express";
import { executePaymentsController } from "../controllers/paymentExecution.controller.js";

const router = express.Router();

export default function paymentExecutionRoutes() {
  router.post(
    "/:migration_id",
    executePaymentsController
  );
  return router;
}
