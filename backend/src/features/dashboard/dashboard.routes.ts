import { Router } from "express"
import { DashboardController } from "./dashboard.controller"
import { authMiddleware, checkPermission } from "../../middlewares/auth"

const router = Router()


router.get(
  "/stats",
  authMiddleware,
  checkPermission("dashboard:read"),
  DashboardController.getStats
)

export const DashboardRoutes = router
