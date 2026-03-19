const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const mongoose = require("mongoose");

// Multer stocke en mémoire, on upload ensuite dans GridFS manuellement
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Format non supporté. Seuls les PDF, JPG et PNG sont autorisés."), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Fonction à appeler après upload.single() dans le controller
async function saveToGridFS(file) {
  const bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "upload",
  });

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = { "application/pdf": ".pdf", "image/jpeg": ".jpg", "image/png": ".png" };
  const filename = "invoice-" + uniqueSuffix + (ext[file.mimetype] ?? "");

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { originalName: file.originalname },
    });

    uploadStream.on("finish", () => resolve({
      id: uploadStream.id,       // ObjectId GridFS → gridfsId dans ton Document
      filename,
      size: file.size,
      mimetype: file.mimetype,
      originalname: file.originalname,
    }));
    uploadStream.on("error", reject);

    uploadStream.end(file.buffer);  // file.buffer vient de memoryStorage
  });
}

module.exports = { upload, saveToGridFS };