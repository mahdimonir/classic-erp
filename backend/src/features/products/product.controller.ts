import { Request, Response, NextFunction } from "express"
import { ProductService } from "./product.service"
import { sendResponse } from "../../shared/response/sendResponse"

export class ProductController {
  static createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const imageUrl = req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : undefined
      const result = await ProductService.createProduct(req.body, imageUrl)
      
      sendResponse(res, {
        success: true,
        statusCode: 201,
        message: "Product created successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  static getAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { data, meta } = await ProductService.getAllProducts(req.query)
      
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Products retrieved successfully",
        meta,
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  static getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ProductService.getProductById(req.params.id)
      
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Product retrieved successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  static updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const imageUrl = req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : undefined
      const result = await ProductService.updateProduct(req.params.id, req.body, imageUrl)
      
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Product updated successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  static deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ProductService.deleteProduct(req.params.id)
      
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Product deleted successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
}
