import express from "express";
import {
  activate,
  pause,
  cancel
} from "../controllers/subscriptionController.js";

const router = express.Router();

export default function () {
  router.post("/:migration_id/activate", activate);
  router.post("/:migration_id/pause", pause);
  router.post("/:migration_id/  ", cancel);

  return router;
}
