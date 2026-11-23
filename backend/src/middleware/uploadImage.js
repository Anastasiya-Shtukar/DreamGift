import multer from "multer";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 10,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(new Error("Only JPG, PNG and WebP images are allowed"));
    }

    callback(null, true);
  },
});
