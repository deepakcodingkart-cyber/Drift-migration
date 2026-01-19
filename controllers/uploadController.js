import path from "path";
import fs from "fs-extra";
import { mergeChunksIfComplete } from "../utils/chunkFile.util.js";

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
    if (!req.file) {
      return res.status(400).json({ message: "Chunk is required" });
    }

    const { fileName, chunkIndex, totalChunks, fileSize } = req.body;

    /* ---------- SAFETY VALIDATIONS ---------- */

    if (Number(fileSize) > MAX_FILE_SIZE) {
      return res.status(400).json({ message: "File exceeds 25MB limit" });
    }

    if (Number(totalChunks) > MAX_CHUNKS) {
      return res.status(400).json({ message: "Too many chunks" });
    }

    if (req.file.size > MAX_CHUNK_SIZE) {
      return res.status(400).json({ message: "Chunk exceeds 5MB" });
    }

   
    // CURRENT: LOCAL FILE SYSTEM

    const chunkDir = path.join(TEMP_DIR, fileName);
    await fs.ensureDir(chunkDir);

    const chunkPath = path.join(chunkDir, String(chunkIndex));
    await fs.writeFile(chunkPath, req.file.buffer);

    await mergeChunksIfComplete({
      chunkDir,
      fileName,
      totalChunks,
      uploadDir: UPLOAD_DIR
    });

    /* 
     FUTURE: S3 MULTIPART (COMMENTED) 

    /*
    await uploadChunkToS3({
      fileName,
      chunkIndex,
      totalChunks,
      buffer: req.file.buffer,
      mimeType: req.file.mimetype
    });

    // only on last chunk
    if (Number(chunkIndex) === Number(totalChunks) - 1) {
      await completeS3Upload({ fileName });
    }
    */

    return res.json({ success: true });
  } catch (err) {
    console.error("uploadChunkController error:", err);
    return res.status(500).json({
      success: false,
      message: "Chunk upload failed",
      error: err.message
    });
  }
}
