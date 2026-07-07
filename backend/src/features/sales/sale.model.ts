import { Schema, model } from "mongoose"
import { ISale, ISaleItem } from "./sale.interface"

const saleItemSchema = new Schema<ISaleItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
})

const saleSchema = new Schema<ISale>(
  {
    products: [saleItemSchema],
    grandTotal: { type: Number, required: true, min: 0 },
    soldBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
)


saleSchema.index({ createdAt: -1 })
saleSchema.index({ soldBy: 1 })

export const Sale = model<ISale>("Sale", saleSchema)
