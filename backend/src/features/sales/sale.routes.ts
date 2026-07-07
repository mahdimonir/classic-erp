import { Router } from "express"
import { SalesController } from "./sale.controller"
import { authMiddleware, checkPermission } from "../../middlewares/auth"
import { validateRequest } from "../../middlewares/validateRequest"
import { createSaleSchema } from "./sale.validation"

const router = Router()


router.post(
  "/",
  authMiddleware,
  checkPermission("sales:create"),
  validateRequest(createSaleSchema),
  SalesController.createSale
)


router.get(
  "/",
  authMiddleware,
  checkPermission("sales:read"),
  SalesController.getAllSales
)

export const SaleRoutes = router
