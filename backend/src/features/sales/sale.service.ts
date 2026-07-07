import mongoose from "mongoose"
import { Sale } from "./sale.model"
import { Product } from "../products/product.model"
import { BadRequestError } from "../../shared/errors/AppError"
import { getIO } from "../../config/socket"

export class SalesService {
  static async createSale(userId: string, productsInput: { product: string; quantity: number }[]) {
    let session: mongoose.ClientSession | null = null
    
    try {
      session = await mongoose.startSession()
      session.startTransaction()
      const sale = await this.executeCreateSaleFlow(userId, productsInput, session)
      await session.commitTransaction()
      session.endSession()
      this.emitSocketNotification(sale)
      return sale
    } catch (error: any) {
      if (session) {
        try {
          await session.abortTransaction()
        } catch (abortErr) {
          
        }
        session.endSession()
      }

      
      const errorMessage = error?.message || ""
      if (
        errorMessage.includes("transaction") || 
        errorMessage.includes("replica set") ||
        error?.codeName === "TransactionOutcomeUnknown"
      ) {
        console.warn("MongoDB Transactions are not supported in this environment. Executing without transactions.")
        const sale = await this.executeCreateSaleFlow(userId, productsInput)
        this.emitSocketNotification(sale)
        return sale
      }
      throw error
    }
  }

  private static async executeCreateSaleFlow(
    userId: string,
    productsInput: { product: string; quantity: number }[],
    session?: mongoose.ClientSession
  ) {
    const productIds = productsInput.map(item => new mongoose.Types.ObjectId(item.product))

    
    const products = session
      ? await Product.find({ _id: { $in: productIds } }).session(session)
      : await Product.find({ _id: { $in: productIds } })

    const productsMap = new Map(products.map((p) => [p._id.toString(), p]))
    const bulkOps = []
    const saleProducts = []
    let grandTotal = 0

    
    for (const item of productsInput) {
      const product = productsMap.get(item.product)

      if (!product) {
        throw new BadRequestError(`Product with ID '${item.product}' not found`)
      }

      if (product.stockQuantity < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for product '${product.name}'. Available: ${product.stockQuantity}, Requested: ${item.quantity}`
        )
      }

      
      product.stockQuantity -= item.quantity

      
      bulkOps.push({
        updateOne: {
          filter: { _id: product._id, stockQuantity: { $gte: item.quantity } },
          update: { $inc: { stockQuantity: -item.quantity } },
        },
      })

      const itemTotal = product.sellingPrice * item.quantity
      grandTotal += itemTotal

      saleProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: product.sellingPrice,
      })
    }

    
    if (bulkOps.length > 0) {
      if (session) {
        await Product.bulkWrite(bulkOps, { session })
      } else {
        await Product.bulkWrite(bulkOps)
      }
    }

    
    let newSale
    if (session) {
      const [createdSale] = await Sale.create(
        [
          {
            products: saleProducts,
            grandTotal,
            soldBy: new mongoose.Types.ObjectId(userId),
          },
        ],
        { session }
      )
      newSale = createdSale
    } else {
      newSale = await Sale.create({
        products: saleProducts,
        grandTotal,
        soldBy: new mongoose.Types.ObjectId(userId),
      })
    }

    
    const populatedSale = await Sale.findById(newSale._id)
      .populate("products.product")
      .populate("soldBy", "name email")
      .lean()

    return populatedSale
  }

  private static emitSocketNotification(sale: any) {
    try {
      const io = getIO()
      io.emit("saleCreated", {
        message: `A new sale has been processed by ${sale?.soldBy?.name || "User"}!`,
        saleId: sale?._id,
        grandTotal: sale?.grandTotal,
      })
    } catch (ioError) {
      console.warn("Socket broadcast omitted (Socket server not active yet).")
    }
  }

  static async getAllSales(query: Record<string, any>) {
    const page = Math.max(Number(query?.page) || 1, 1)
    const limit = Math.max(Number(query?.limit) || 10, 1)
    const skip = (page - 1) * limit

    
    const [data, total] = await Promise.all([
      Sale.find()
        .populate("products.product")
        .populate("soldBy", "name email")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      Sale.countDocuments(),
    ])

    const totalPage = Math.ceil(total / limit)

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPage,
      },
    }
  }
}
