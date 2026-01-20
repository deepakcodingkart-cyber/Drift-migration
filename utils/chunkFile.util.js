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
        return false;
    }

    const finalPath = path.join(uploadDir, fileName);

    await new Promise(async (resolve, reject) => {
        const writeStream = fs.createWriteStream(finalPath);

        writeStream.on("finish", resolve);
        writeStream.on("error", reject);

        try {
            for (let i = 0; i < totalChunks; i++) {
                const chunkPath = path.join(chunkDir, String(i));
                const data = await fs.readFile(chunkPath);
                writeStream.write(data);
            }
            writeStream.end();
        } catch (err) {
            writeStream.destroy();
            reject(err);
        }
    });

    await fs.remove(chunkDir);

    return true;
}

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