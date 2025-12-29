import express from "express";
import { checkAvailability, createEvent, deleteEvent, getAllEvents, getEventById, updateEvent } from "../controllers/event.controller.js";
import { authenticate, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.get("/:id/availability", checkAvailability);

// Admin routes
router.post("/", authenticate, isAdmin, createEvent);
router.put("/:id", authenticate, isAdmin, updateEvent);
router.delete("/:id", authenticate, isAdmin, deleteEvent);

export default router;
