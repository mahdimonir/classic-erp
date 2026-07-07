import { Types } from "mongoose"

export interface ISaleItem {
  product: Types.ObjectId
  quantity: number
  price: number
}

export interface ISale {
  products: ISaleItem[]
  grandTotal: number
  soldBy: Types.ObjectId
}
