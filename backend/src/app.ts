import cors from "cors"
import dotenv from "dotenv"
import express, { NextFunction, Request, Response } from "express"
import morgan from "morgan"
import path from "path"
import connectDB from "./config/db"
import { setupSwagger } from "./config/swagger"
import { AuthRoutes } from "./features/auth/auth.routes"
import { DashboardRoutes } from "./features/dashboard/dashboard.routes"
import { ProductRoutes } from "./features/products/product.routes"
import { SaleRoutes } from "./features/sales/sale.routes"
import { globalErrorHandler } from "./middlewares/globalErrorHandler"
import { NotFoundError } from "./shared/errors/AppError"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

let isDbConnected = false
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (!isDbConnected) {
    try {
      await connectDB()
      isDbConnected = true
    } catch (err: any) {
      console.error("Database connection failure:", err.message || err)
      return res.status(500).json({
        success: false,
        message: "Database connection failed. Verify MONGO_URI and IP whitelist.",
        error: err.message || String(err)
      })
    }
  }
  next()
})

const isVercel = process.env.VERCEL === "1"
const uploadDir = isVercel ? "/tmp" : path.join(process.cwd(), "uploads")
app.use("/uploads", express.static(uploadDir))

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"))
}

setupSwagger(app)

app.use("/api/auth", AuthRoutes)
app.use("/api/products", ProductRoutes)
app.use("/api/sales", SaleRoutes)
app.use("/api/dashboard", DashboardRoutes)

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Classic ERP API. Go to /api-docs for documentation.",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      docs: "/api-docs"
    }
  })
})

app.get(["/health", "/api/health"], (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "OK" })
})

app.get("/docs", (req: Request, res: Response) => {
  res.redirect("/api-docs")
})

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Requested path '${req.originalUrl}' not found`))
})

app.use(globalErrorHandler)

export default app
