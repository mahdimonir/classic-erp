import { Request, Response, NextFunction } from "express"
import { DashboardService } from "./dashboard.service"
import { sendResponse } from "../../shared/response/sendResponse"

export class DashboardController {
  static getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await DashboardService.getDashboardStats()
      
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Dashboard stats retrieved successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
}
