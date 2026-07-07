import express, { Request, Response, NextFunction } from "express"
import path from "path"
import cors from "cors"
import morgan from "morgan"
import dotenv from "dotenv"
import { AuthRoutes } from "./features/auth/auth.routes"
import { ProductRoutes } from "./features/products/product.routes"
import { SaleRoutes } from "./features/sales/sale.routes"
import { DashboardRoutes } from "./features/dashboard/dashboard.routes"
import { setupSwagger } from "./config/swagger"
import { globalErrorHandler } from "./middlewares/globalErrorHandler"
import { NotFoundError } from "./shared/errors/AppError"

dotenv.config()

const app = express()


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))


if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"))
}


setupSwagger(app)


app.use("/api/auth", AuthRoutes)
app.use("/api/products", ProductRoutes)
app.use("/api/sales", SaleRoutes)
app.use("/api/dashboard", DashboardRoutes)


app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server is healthy and running!" })
})


app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Requested path '${req.originalUrl}' not found`))
})


app.use(globalErrorHandler)

export default app
