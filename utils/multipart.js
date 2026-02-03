import Busboy from "busboy";
import fs from "fs";
import os from "os";
import path from "path";
import { randomBytes } from "crypto";

/**
 * Generates a random temp file path.
 * @returns {string}
 */
const getTempFilePath = () => {
  const name = randomBytes(16).toString("hex");
  return path.join(os.tmpdir(), `nicola-${name}`);
};

/**
 * Cleanup helper to remove a file silently.
 * @param {string} filePath
 */
const cleanupFile = (filePath) => {
  fs.unlink(filePath, () => {}); // Verify existence not strictly needed, ignore error
};

/**
 * Handles a single file upload stream with cleanup on error.
 * @param {object} file - Busboy file stream
 * @param {string} filename
 * @param {number} limitBytes - File size limit
 * @returns {Promise<object>}
 */
const handleFileStream = (file, filename, limitBytes) => {
  return new Promise((resolve, reject) => {
    const tempPath = getTempFilePath();
    const writeStream = fs.createWriteStream(tempPath);
    let size = 0;
    let limitReached = false;

    // Handle internal file limit event from Busboy
    file.on("limit", () => {
      limitReached = true;
      // Busboy truncates; we must cleanup and reject.
      // We need to unpipe or destroy the stream.
      file.unpipe(writeStream);
      writeStream.end();
    });

    file.on("data", (chunk) => {
      size += chunk.length;
      if (!limitReached && size > limitBytes) {
        // Double check manual limit if busboy didn't catch it yet
        limitReached = true;
        file.resume(); // Drain the stream
        file.unpipe(writeStream);
        writeStream.end();
      }
    });

    file.on("error", (err) => {
      cleanupFile(tempPath);
      reject(err);
    });

    writeStream.on("error", (err) => {
      cleanupFile(tempPath);
      reject(err);
    });

    writeStream.on("finish", () => {
      if (limitReached) {
        cleanupFile(tempPath);
        reject(new Error(`File size limit exceeded: ${filename}`));
      } else {
        resolve({ path: tempPath, size });
      }
    });

    file.pipe(writeStream);
  });
};

/**
 * Parses a multipart request stream using Busboy and saves files to disk.
 * Supports limits and automatic cleanup.
 * @param {import('http').IncomingMessage} req - The HTTP request object.
 * @returns {Promise<{files: Object, fields: Object}>}
 */
export const parseMultipart = (req) => {
  return new Promise((resolve, reject) => {
    const results = { files: {}, fields: {} };
    const pendingWrites = [];

    if (!req.headers["content-type"]?.includes("multipart/form-data")) {
      return reject(
        new Error("Invalid Content-Type or missing headers for multipart"),
      );
    }

    // Default limit: 50MB or env var
    const fileSizeLimit =
      Number(process.env.NICOLA_UPLOAD_LIMIT) || 50 * 1024 * 1024;

    let busboy;
    try {
      busboy = Busboy({
        headers: req.headers,
        limits: {
          fileSize: fileSizeLimit,
        },
      });
    } catch (err) {
      return reject(err);
    }

    busboy.on("file", (name, file, info) => {
      const { filename, mimeType } = info;

      const writePromise = handleFileStream(file, filename, fileSizeLimit)
        .then(({ path, size }) => {
          results.files[name] = {
            filename,
            type: mimeType,
            path,
            size,
          };
        })
        .catch((err) => {
          // Clean Code principle: Keep it robust.
          // We will propagate error, and caller (middleware) will have to handle generic error.
          throw err;
        });

      pendingWrites.push(writePromise);
    });

    busboy.on("field", (name, val) => {
      results.fields[name] = val;
    });

    busboy.on("error", reject);

    busboy.on("finish", () => {
      Promise.all(pendingWrites)
        .then(() => resolve(results))
        .catch((err) => {
          // Cleanup all successful files if one failed
          Object.values(results.files).forEach((f) => cleanupFile(f.path));
          reject(err);
        });
    });

    req.pipe(busboy);
  });
};
