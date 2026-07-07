import { Router } from "express"
import { AuthController } from "./auth.controller"
import { validateRequest } from "../../middlewares/validateRequest"
import { loginSchema, registerSchema } from "./auth.validation"
import { authMiddleware, checkPermission } from "../../middlewares/auth"

const router = Router()


router.post(
  "/register",
  validateRequest(registerSchema),
  AuthController.register
)


router.post("/login", validateRequest(loginSchema), AuthController.login)


router.get("/me", authMiddleware, AuthController.getMe)


router.get("/users", authMiddleware, checkPermission("roles:manage"), AuthController.getAllUsers)


router.put("/users/:id/role", authMiddleware, checkPermission("roles:manage"), AuthController.updateUserRole)


router.get("/roles", authMiddleware, checkPermission("roles:manage"), AuthController.getAllRoles)


router.put("/roles/:id/permissions", authMiddleware, checkPermission("roles:manage"), AuthController.updateRolePermissions)


router.get("/permissions", authMiddleware, checkPermission("roles:manage"), AuthController.getAllPermissions)

export const AuthRoutes = router
