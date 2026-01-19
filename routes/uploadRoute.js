import express from "express";
import { uploadChunkController } from "../controllers/uploadController.js";

const router = express.Router();

export default function (upload) {
  router.post("/chunk", upload.single("chunk"), uploadChunkController);
  return router;
}
