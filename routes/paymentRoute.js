import express from "express";
import { revoke } from "../controllers/paymentController.js";

const router = express.Router();

export default function () {
  router.post("/:migration_id/revoke", revoke);
  return router;
}
