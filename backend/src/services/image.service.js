import sharp from "sharp";
import { Readable } from "node:stream";
import cloudinary from "../config/cloudinary.js";

export const uploadProductImage = async (buffer) => {
  const metadata = await sharp(buffer, {
    limitInputPixels: 25_000_000,
  }).metadata();

  if (!["jpeg", "png", "webp"].includes(metadata.format)) {
    const error = new Error("Unsupported image format");
    error.status = 400;
    throw error;
  }

  const optimizedBuffer = await sharp(buffer, {
    limitInputPixels: 25_000_000,
  })
    .rotate()
    .resize({
      width: 1200,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "dreamgift/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);

        if (!result) {
          return reject(new Error("Cloudinary upload failed"));
        }

        resolve({
          imageUrl: result.secure_url,
          imagePublicId: result.public_id,
        });
      },
    );

    Readable.from([optimizedBuffer]).pipe(stream);
  });
};

export const deleteProductImage = async (publicId) => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};
