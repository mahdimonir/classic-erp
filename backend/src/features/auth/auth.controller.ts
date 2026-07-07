import { Request, Response, NextFunction } from "express"
import { AuthService } from "./auth.service"
import { sendResponse } from "../../shared/response/sendResponse"

export class AuthController {
  static login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await AuthService.loginUser(req.body)
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Login successful",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  static register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await AuthService.registerUser(req.body)
      sendResponse(res, {
        success: true,
        statusCode: 201,
        message: "User registered successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  static getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      
      const userId = req.user?.id
      const result = await AuthService.getMe(userId!)
      
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "User profile retrieved successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  static getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await AuthService.getAllUsers()
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Users retrieved successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  static updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await AuthService.updateUserRole(req.params.id, req.body.roleSlug)
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "User role updated successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  static getAllRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await AuthService.getAllRoles()
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Roles retrieved successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  static updateRolePermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await AuthService.updateRolePermissions(req.params.id, req.body.permissions)
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Role permissions updated successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  static getAllPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await AuthService.getAllPermissions()
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Permissions retrieved successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
}
