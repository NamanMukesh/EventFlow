import express from "express";
import {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook,
  getPaymentStatus
} from "../controllers/payment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Payment routes
router.post("/create-intent", authenticate, createPaymentIntent);
router.post("/confirm", authenticate, confirmPayment);
router.get("/status/:bookingId", authenticate, getPaymentStatus);

export default router;
export { stripeWebhook };

