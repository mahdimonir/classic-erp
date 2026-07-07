import { Router } from "express"
import { ProductController } from "./product.controller"
import { authMiddleware, checkPermission } from "../../middlewares/auth"
import { validateRequest } from "../../middlewares/validateRequest"
import { upload } from "../../middlewares/multer"
import { createProductSchema, updateProductSchema } from "./product.validation"

const router = Router()


router.post(
  "/",
  authMiddleware,
  checkPermission("products:create"),
  upload.single("image"),
  validateRequest(createProductSchema),
  ProductController.createProduct
)


router.get(
  "/",
  authMiddleware,
  checkPermission("products:read"),
  ProductController.getAllProducts
)


router.get(
  "/:id",
  authMiddleware,
  checkPermission("products:read"),
  ProductController.getProductById
)


router.put(
  "/:id",
  authMiddleware,
  checkPermission("products:update"),
  upload.single("image"),
  validateRequest(updateProductSchema),
  ProductController.updateProduct
)


router.delete(
  "/:id",
  authMiddleware,
  checkPermission("products:delete"),
  ProductController.deleteProduct
)

export const ProductRoutes = router
