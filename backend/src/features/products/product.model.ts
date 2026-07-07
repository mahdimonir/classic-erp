import { Schema, model } from "mongoose"
import { IProduct } from "./product.interface"

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true },
    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    stockQuantity: { type: Number, required: true, min: 0 },
    productImage: { type: String, required: true },
  },
  { timestamps: true }
)


productSchema.index({ name: 1 })
productSchema.index({ category: 1 })
productSchema.index({ stockQuantity: 1 })
productSchema.index({ createdAt: -1 })

export const Product = model<IProduct>("Product", productSchema)
