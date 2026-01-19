import fs from "fs-extra";
import path from "path";

export async function mergeChunksIfComplete({
  chunkDir,
  fileName,
  totalChunks,
  uploadDir
}) {
  const uploadedChunks = await fs.readdir(chunkDir);

  if (uploadedChunks.length !== Number(totalChunks)) {
    return;
  }

  /* ======================================================
     ============ CURRENT: LOCAL MERGE =====================
     ====================================================== */

  const finalPath = path.join(uploadDir, fileName);
  const writeStream = fs.createWriteStream(finalPath);

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(chunkDir, String(i));
    const data = await fs.readFile(chunkPath);
    writeStream.write(data);
  }

  writeStream.end();
  await fs.remove(chunkDir);

  /* ======================================================
     ============ FUTURE: S3 PUT / MULTIPART ===============
     ====================================================== */

  /*
  // OPTION A: Simple PutObject (25MB case)
  await uploadToS3({
    buffer: finalBuffer,
    fileName,
    mimeType: "text/csv"
  });

  // OPTION B: Multipart S3 (if ever needed)
  // handled directly per chunk, no merge needed
  */
}
