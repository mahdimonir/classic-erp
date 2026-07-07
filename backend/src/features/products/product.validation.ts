import { z } from "zod"

export const createProductSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Product name is required" }).min(2, "Product name must be at least 2 characters"),
    sku: z.string({ required_error: "SKU is required" }).min(3, "SKU must be at least 3 characters"),
    category: z.string({ required_error: "Category is required" }),
    purchasePrice: z.coerce.number({ required_error: "Purchase price is required" }).positive("Purchase price must be a positive number"),
    sellingPrice: z.coerce.number({ required_error: "Selling price is required" }).positive("Selling price must be a positive number"),
    stockQuantity: z.coerce.number({ required_error: "Stock quantity is required" }).int().nonnegative("Stock quantity cannot be negative"),
  }),
})

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Product name must be at least 2 characters").optional(),
    sku: z.string().min(3, "SKU must be at least 3 characters").optional(),
    category: z.string().optional(),
    purchasePrice: z.coerce.number().positive("Purchase price must be a positive number").optional(),
    sellingPrice: z.coerce.number().positive("Selling price must be a positive number").optional(),
    stockQuantity: z.coerce.number().int().nonnegative("Stock quantity cannot be negative").optional(),
  }),
})
