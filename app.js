import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import multer from "multer";

// import validateRoutes from "./routes/validateRoute.js";
import uploadRoutes from "./routes/uploadRoute.js";
import migrationRoutes from "./routes/migrationRoute.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 250 * 1024 * 1024 }
});

// app.use("/validate", validateRoutes(upload));
app.use("/upload", uploadRoutes(upload));
app.use("/migrations", migrationRoutes());

app.listen(PORT, () => {
  console.log(`✅ Migration Validation API running on ${PORT}`);
});
