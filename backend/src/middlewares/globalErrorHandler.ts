import { ErrorRequestHandler } from "express"
import { ZodError } from "zod"
import { AppError } from "../shared/errors/AppError"

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || "Internal Server Error"
  let errors: any = undefined

  
  if (err instanceof ZodError) {
    statusCode = 400
    message = "Validation Error"
    errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }))
  }
  
  else if (err.name === "ValidationError") {
    statusCode = 400
    message = "Validation Error"
    errors = Object.values(err.errors).map((el: any) => ({
      field: el.path,
      message: el.message,
    }))
  } else if (err.name === "CastError") {
    statusCode = 400
    message = `Invalid value for ${err.path}: ${err.value}`
  } else if (err.code === 11000) {
    statusCode = 400
    const key = Object.keys(err.keyValue)[0]
    message = `Duplicate entry for field: ${key}. Please use a unique value.`
  }
  
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401
    message = "Invalid auth token. Access denied."
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401
    message = "Auth token expired. Please login again."
  }
  
  else if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
    if ((err as any).errors) {
      errors = (err as any).errors
    }
  }

  
  console.error("Global Error Interceptor:", {
    name: err.name,
    message: err.message,
    statusCode,
    stack: err.stack,
  })

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
}
