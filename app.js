import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import multer from "multer";

import validateRoutes from "./routes/validateRoute.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

app.use("/validate", validateRoutes(upload));

app.listen(PORT, () => {
  console.log(`✅ Migration Validation API running on ${PORT}`);
});
