import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { UnauthorizedError, ForbiddenError } from "../shared/errors/AppError"
import { User } from "../features/auth/user.model"

interface IDecodedUser {
  id: string
  email: string
  role: string
  permissions: string[]
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authorization token required")
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    ) as IDecodedUser

    req.user = decoded
    next()
  } catch (error) {
    next(error)
  }
}


export const checkPermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("User is not authenticated")
      }

      const { permissions } = req.user

      
      const isAuthorized =
        permissions.includes(requiredPermission) ||
        permissions.includes("roles:manage")

      if (!isAuthorized) {
        throw new ForbiddenError("Access denied. Insufficient permissions.")
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
