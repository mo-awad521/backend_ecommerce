import { Router } from "express";
import { paymentController } from "../controllers/index.js";
import { auth, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", auth, paymentController.createPayment);
router.get("/:orderId", auth, paymentController.getPayment);
router.put("/:orderId", auth, paymentController.updatePayment);

// ✅ only admin can get the payments
router.get("/", auth, isAdmin, paymentController.getAllPayments);

export default router;
