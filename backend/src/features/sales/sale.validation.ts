import { z } from "zod"

const objectIdRegex = /^[0-9a-fA-F]{24}$/

export const createSaleSchema = z.object({
  body: z.object({
    products: z
      .array(
        z.object({
          product: z.string().regex(objectIdRegex, "Invalid product ID"),
          quantity: z
            .number({ required_error: "Quantity is required" })
            .int()
            .positive("Quantity must be a positive integer"),
        }),
        { required_error: "Products list is required" }
      )
      .min(1, "A sale must contain at least one product"),
  }),
})
