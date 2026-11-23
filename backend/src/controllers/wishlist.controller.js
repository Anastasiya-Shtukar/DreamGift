import pool from "../db.js";
import { z } from "zod";
import { createWishlistItemSchema } from "../validators/wishlist.validator.js";
import { uploadProductImage, deleteProductImage } from "../services/image.service.js";

export const getMyWishlist = async (req, res) => {
  const userId = req.session.userId;

  try {
    const result = await pool.query(
      `
        SELECT
          w.id,
          w.created_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', wi.id,
                'name', wi.name,
                'description', wi.description,
                'url', wi.url,
                'price', wi.price,
                'currency', wi.currency,
                'imageUrl', wi.image_url,
                'createdAt', wi.created_at
              )
              ORDER BY wi.created_at DESC, wi.id
            ) FILTER (WHERE wi.id IS NOT NULL),
            '[]'::json
          ) AS items
        FROM wishlists w
        LEFT JOIN wishlist_items wi
          ON wi.wishlist_id = w.id
        WHERE w.user_id = $1
        GROUP BY w.id, w.created_at
      `,
      [userId],
    );

    const wishlist = result.rows[0];

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    return res.status(200).json({ wishlist });
  } catch (error) {
    console.error("Get wishlist error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createWishlistItem = async (req, res) => {
  const validation = createWishlistItemSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid input data",
      errors: z.treeifyError(validation.error),
    });
  }

  const { name, description, url, price, currency } = validation.data;

  let uploadedImage = null;

  try {
    if (req.file) {
      uploadedImage = await uploadProductImage(req.file.buffer);
    }

    const result = await pool.query(
      `
        INSERT INTO wishlist_items (
          wishlist_id,
          name,
          description,
          url,
          price,
          currency,
          image_url,
          image_public_id
        )
        SELECT
          w.id, $2, $3, $4, $5, $6, $7, $8
        FROM wishlists w
        WHERE w.user_id = $1
        RETURNING
          id,
          name,
          description,
          url,
          price,
          currency,
          image_url,
          created_at
      `,
      [
        req.session.userId,
        name,
        description || null,
        url || null,
        price === "" || price === undefined ? null : price,
        currency || null,
        uploadedImage?.imageUrl ?? null,
        uploadedImage?.imagePublicId ?? null,
      ],
    );

    const item = result.rows[0];

    if (!item) {
      if (uploadedImage) {
        await deleteProductImage(uploadedImage.imagePublicId);
      }

      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    return res.status(201).json({ item });
  } catch (error) {
    if (uploadedImage) {
      try {
        await deleteProductImage(uploadedImage.imagePublicId);
      } catch (cleanupError) {
        console.error("Image cleanup error:", cleanupError);
      }
    }

    console.error("Create wishlist item error:", error);

    return res.status(error.status === 400 ? 400 : 500).json({
      message: error.status === 400 ? error.message : "Failed to create wishlist item",
    });
  }
};
