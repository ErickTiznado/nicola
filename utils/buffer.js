export const readBuffer = (req, res) => {
  return new Promise((resolve, reject) => {
    const limit = Number(process.env.BUFFER_LIMIT) || 5e6;
    const chunks = [];
    let totalSize = 0;

    req.on("data", (chunk) => {
      chunks.push(chunk);
      totalSize += chunk.length;

      if (totalSize > limit) {
        req.destroy();

        reject(new Error("Request Entity Too Large"));
      }
    });

    req.on("end", () => {
      try {
        const fullBuffer = Buffer.concat(chunks);

        resolve(fullBuffer);
      } catch (e) {
        reject(e);
      }
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
};
