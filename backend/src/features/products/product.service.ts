import { Product } from "./product.model"
import { IProduct } from "./product.interface"
import { QueryBuilder } from "../../shared/queryBuilder/QueryBuilder"
import { BadRequestError, NotFoundError } from "../../shared/errors/AppError"

export class ProductService {
  static async createProduct(payload: Partial<IProduct>, imageUrl?: string) {
    
    if (!imageUrl) {
      throw new BadRequestError("Product image upload is required while creating a product")
    }

    payload.productImage = imageUrl

    
    try {
      const newProduct = await Product.create(payload)
      return newProduct
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestError(`Product with SKU '${payload.sku}' already exists`)
      }
      throw error
    }
  }

  static async getAllProducts(query: Record<string, any>) {
    const searchableFields = ["name", "sku", "category"]
    
    
    const productQuery = new QueryBuilder(Product.find(), query)
      .search(searchableFields)
      .filter()
      .sort()
      .paginate()
      .fields()
      .lean()

    const data = await productQuery.modelQuery
    const meta = await productQuery.countTotal()

    return {
      data,
      meta,
    }
  }

  static async getProductById(id: string) {
    const product = await Product.findById(id).lean()
    if (!product) {
      throw new NotFoundError("Product not found")
    }
    return product
  }

  static async updateProduct(id: string, payload: Partial<IProduct>, imageUrl?: string) {
    
    if (imageUrl) {
      payload.productImage = imageUrl
    }

    try {
      
      const updatedProduct = await Product.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      }).lean()

      if (!updatedProduct) {
        throw new NotFoundError("Product not found")
      }

      return updatedProduct
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestError(`Product with SKU '${payload.sku}' already exists`)
      }
      throw error
    }
  }

  static async deleteProduct(id: string) {
    
    const product = await Product.findByIdAndDelete(id).lean()
    if (!product) {
      throw new NotFoundError("Product not found")
    }

    return { id }
  }
}
