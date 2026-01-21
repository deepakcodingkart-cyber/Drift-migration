import path from "path";
import fs from "fs-extra";

import { mergeChunksIfComplete } from "../utils/chunkFile.util.js";
import { getMigrationById, updateMigration } from "../services/migration.service.js";
import { upsertMigrationFile } from "../services/migrationFiles.service.js";

const TEMP_DIR = "./temp";
const UPLOAD_DIR = "./uploads";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

// 🔒 locked filenames (canonical)
const FILE_NAME_MAP = {
  subscription_csv: "subscription.csv",
  payment_stripe_csv: "payment_stripe.csv",
  payment_paypal_csv: "payment_paypal.csv",
  payment_braintree_csv: "payment_braintree.csv",
  attribute_csv: "attribute.csv"
};

fs.ensureDirSync(TEMP_DIR);
fs.ensureDirSync(UPLOAD_DIR);

export async function uploadChunkController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Chunk is required" });
    }

    const {
      fileName,
      chunkIndex,
      totalChunks,
      fileSize,
      migration_id,
      // migration_type,
      file_type
    } = req.body;

    const migration_type = req.body?.migration_type || 'data';

    /* ---------- VALIDATION ---------- */
    if (!migration_id || !migration_type || !file_type) {
      return res.status(400).json({
        success: false,
        message: "migration_id, migration_type and file_type are required"
      });
    }
    if (!fileName || !chunkIndex || !totalChunks || !fileSize || !file_type) {
      return res.status(400).json({ success: false, success: false, message: "Missing required fields" });
    }

    if (Number(fileSize) > MAX_FILE_SIZE) {
      return res.status(400).json({ success: false, message: "File too large" });
    }

    if (req.file.size > MAX_CHUNK_SIZE) {
      return res.status(400).json({ success: false, message: "Chunk too large" });
    }

    /* ---------- VERIFY MIGRATION ---------- */
    const migration = await getMigrationById(migration_id);
    if (!migration) {
      return res.status(404).json({
        success: false,
        message: "Migration not found"
      });
    }

    /* ---------- SAVE CHUNK ---------- */
    const tempKey = `${migration_id}_${file_type}`;
    const chunkDir = path.join(TEMP_DIR, tempKey);

    await fs.ensureDir(chunkDir);
    await fs.writeFile(
      path.join(chunkDir, String(chunkIndex)),
      req.file.buffer
    );

    /* ---------- MERGE ---------- */
    const merged = await mergeChunksIfComplete({
      chunkDir,
      fileName: tempKey,
      totalChunks,
      uploadDir: UPLOAD_DIR
    });

    if (!merged) {
      return res.json({ success: true, stage: "chunk_received" });
    }

    /* ---------- FINAL FILE LOCATION ---------- */
    const originalDir = path.join(
      UPLOAD_DIR,
      "migrations",
      String(migration_id),
      "original"
    );

    await fs.ensureDir(originalDir);

    const finalFileName = FILE_NAME_MAP[file_type] || fileName;
    const finalFilePath = path.join(originalDir, finalFileName);

    await fs.move(
      path.join(UPLOAD_DIR, tempKey),
      finalFilePath,
      { overwrite: true }
    );

    await fs.chmod(finalFilePath, 0o444); // immutable original

    /* ---------- DB UPSERT ---------- */
    await upsertMigrationFile({
      migration_id,
      migration_type,
      file_type,
      file_name: finalFileName,
      file_path: finalFilePath
    });

    await updateMigration(migration_id, {
      status: "uploaded"
    });

    return res.json({
      success: true,
      stage: "upload_completed",
      migration_id
    });

  } catch (err) {
    console.error("uploadChunkController error:", err);
    return res.status(500).json({
      success: false,
      message: "Upload failed",
      error: err.message
    });
  }
}
