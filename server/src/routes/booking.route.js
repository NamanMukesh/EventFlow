import express from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  confirmBooking,
  getAllBookings
} from "../controllers/booking.controller.js";
import { authenticate, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// User routes
router.post("/", authenticate, createBooking);
router.get("/my-bookings", authenticate, getUserBookings);
router.get("/:id", authenticate, getBookingById);
router.patch("/:id/cancel", authenticate, cancelBooking);
router.patch("/:id/confirm", authenticate, confirmBooking);

// Admin routes
router.get("/", authenticate, isAdmin, getAllBookings);

export default router;