import express from "express";
import { authMiddleware } from "../middleware/auth";
import * as appointmentsController from "../controllers/appointmentsController";

const router = express.Router();

// Get all appointments for a user (no auth required, sharableId in query)
router.get("/", appointmentsController.getAppointments);

// Get available time slots for a user (no auth required, sharableId in query)
router.get("/available", appointmentsController.getAvailableSlots);

// Create appointment (no auth required, sharableId in body)
router.post("/", appointmentsController.createAppointment);

// Edit/Reschedule appointment (requires authentication)
router.patch("/:id", authMiddleware, appointmentsController.editAppointment);

// Delete appointment (requires authentication)
router.delete("/:id", authMiddleware, appointmentsController.deleteAppointment);

export default router;
