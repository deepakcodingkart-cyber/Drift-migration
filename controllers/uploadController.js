import path from "path";
import fs from "fs-extra";

import { mergeChunksIfComplete } from "../utils/chunkFile.util.js";
import { createMigration } from "../services/migration.service.js";

// OPTIONAL (if you add idempotency check later)
// import { findMigrationByFilePath } from "../services/migration.service.js";

/* ===== FUTURE S3 IMPORTS (COMMENTED) ===== */
// import { uploadChunkToS3, completeS3Upload } from "../utils/s3Chunk.util.js";

const TEMP_DIR = "./temp";
const UPLOAD_DIR = "./uploads";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CHUNKS = 5;

fs.ensureDirSync(TEMP_DIR);
fs.ensureDirSync(UPLOAD_DIR);

export async function uploadChunkController(req, res) {
    try {
        /* ---------- FILE GUARD ---------- */
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Chunk is required"
            });
        }

        const {
            fileName,
            chunkIndex,
            totalChunks,
            fileSize,

            // migration metadata
            shop_id,
            shop_domain,
            migration_type,
            file_type,
            created_by
        } = req.body;

        /* ---------- METADATA VALIDATION (MANDATORY) ---------- */
        if (
            !shop_id ||
            !shop_domain ||
            !migration_type ||
            !file_type ||
            !created_by
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing migration metadata"
            });
        }

        /* ---------- SAFETY VALIDATIONS ---------- */
        if (Number(fileSize) > MAX_FILE_SIZE) {
            return res.status(400).json({
                success: false,
                message: "File exceeds 25MB limit"
            });
        }

        if (Number(totalChunks) > MAX_CHUNKS) {
            return res.status(400).json({
                success: false,
                message: "Too many chunks"
            });
        }

        if (req.file.size > MAX_CHUNK_SIZE) {
            return res.status(400).json({
                success: false,
                message: "Chunk exceeds 5MB"
            });
        }

        /* ---------- MULTI-TENANT SAFE FILE NAME ---------- */
        const safeFileName = `${shop_id}_${fileName}`;

        /* ---------- SAVE CHUNK ---------- */
        const chunkDir = path.join(TEMP_DIR, safeFileName);
        await fs.ensureDir(chunkDir);

        const chunkPath = path.join(chunkDir, String(chunkIndex));
        await fs.writeFile(chunkPath, req.file.buffer);

        /* ---------- TRY MERGE ---------- */
        const isMerged = await mergeChunksIfComplete({
            chunkDir,
            fileName: safeFileName,
            totalChunks,
            uploadDir: UPLOAD_DIR
        });

        /* ======================================================
           ============ FUTURE: S3 MULTIPART (COMMENTED) =========
           ====================================================== */
        /*
        await uploadChunkToS3({
          fileName: safeFileName,
          chunkIndex,
          totalChunks,
          buffer: req.file.buffer,
          mimeType: req.file.mimetype
        });
    
        if (Number(chunkIndex) === Number(totalChunks) - 1) {
          await completeS3Upload({ fileName: safeFileName });
        }
        */

        /* ---------- CREATE MIGRATION (ONLY ON FINAL MERGE) ---------- */
        if (isMerged) {
            const finalFilePath = path.join(UPLOAD_DIR, safeFileName);

            // OPTIONAL idempotency guard (enable later if needed)
            /*
            const existing = await findMigrationByFilePath(finalFilePath);
            if (existing) {
              return res.json({
                success: true,
                stage: "upload_completed",
                migration_id: existing.id,
                status: existing.status
              });
            }
            */

            const migration = await createMigration({
                shop_id,
                shop_domain,
                migration_type,
                file_type,
                file_path: finalFilePath,
                status: "uploaded",
                created_by
            });

            return res.json({
                success: true,
                stage: "upload_completed",
                migration_id: migration.id,
                status: migration.status
            });
        }

        /* ---------- NORMAL CHUNK RESPONSE ---------- */
        return res.json({
            success: true,
            stage: "chunk_received"
        });
    } catch (err) {
        console.error("uploadChunkController error:", err);
        return res.status(500).json({
            success: false,
            message: "Chunk upload failed",
            error: err.message
        });
    }
}
