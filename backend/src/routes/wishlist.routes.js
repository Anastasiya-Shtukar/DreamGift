import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { getMyWishlist, createWishlistItem } from "../controllers/wishlist.controller.js";
import { uploadImage } from "../middleware/uploadImage.js";
import multer from "multer";

const router = Router();

router.use(requireAuth);

router.get("/", getMyWishlist);

router.post("/items", uploadImage.single("image"), createWishlistItem);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message: error.message,
    });
  }

  if (error.message === "Only JPG, PNG and WebP images are allowed") {
    return res.status(400).json({
      message: error.message,
    });
  }

  next(error);
});

export default router;
