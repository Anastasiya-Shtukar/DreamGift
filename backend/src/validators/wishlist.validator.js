import { z } from "zod";

const priceSchema = z
  .string()
  .trim()
  .regex(/^\d+([.,]\d{1,2})?$/, "Invalid price")
  .transform((value) => Number(value.replace(",", ".")))
  .pipe(z.number().finite().min(0).max(9999999999.99));

export const createWishlistItemSchema = z
  .object({
    name: z.string().trim().min(1).max(150),

    description: z.string().trim().max(2000).optional(),

    url: z.union([z.literal(""), z.url().max(2048)]).optional(),

    price: z.union([z.literal(""), priceSchema]).optional(),

    currency: z.union([z.literal(""), z.enum(["PLN", "EUR", "USD"])]).optional(),
  })
  .strict()
  .refine((data) => data.price === undefined || data.price === "" || Boolean(data.currency), {
    message: "Currency is required when price is provided",
    path: ["currency"],
  });
