import { Request, Response, NextFunction } from "express"
import { SalesService } from "./sale.service"
import { sendResponse } from "../../shared/response/sendResponse"

export class SalesController {
  static createSale = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id
      const result = await SalesService.createSale(userId!, req.body.products)
      
      sendResponse(res, {
        success: true,
        statusCode: 201,
        message: "Sale completed successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  static getAllSales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { data, meta } = await SalesService.getAllSales(req.query)
      
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Sales retrieved successfully",
        meta,
        data,
      })
    } catch (error) {
      next(error)
    }
  }
}
