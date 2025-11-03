import { Router } from "express";
import { auth, isAdmin } from "../middlewares/authMiddleware.js";
import { productController } from "../controllers/index.js";
import { productValidator } from "../validators/index.js";
import { validate } from "../middlewares/validationRequest.js";
import { upload } from "../middlewares/upload.js";
import { cacheMiddleware } from "../middlewares/cacheMiddleware.js";

// إضافة منتج مع صورة

const router = Router();

router.get("/", cacheMiddleware("products", 60 * 5), productController.getProducts);
router.get("/:id", cacheMiddleware("product", 60 * 5), productController.getProduct);
router.post(
  "/add",
  auth,
  isAdmin,
  upload.array("images", 5), // رفع حتى 5 صور
  productValidator,
  validate,
  productController.createProduct
);
router.put(
  "/update/:id",
  auth,
  isAdmin,
  upload.array("images", 5), // رفع حتى 5 صور
  productValidator,
  validate,
  productController.updateProduct
);
router.delete("/delete/:id", auth, isAdmin, productController.deleteProduct);

export default router;
