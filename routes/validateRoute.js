import express from "express";
import { validateCsvController } from "../controllers/validateController.js";

const router = express.Router();

export default function (upload) {
  router.post("/csv", upload.single("file"), validateCsvController);
  return router;
}
