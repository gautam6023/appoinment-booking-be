import { Request, Response } from "express";
import { Types } from "mongoose";
import { Appointment } from "../models/Appointment";
import { Slot, ISlot } from "../models/Slot";
import { User } from "../models/User";
import { bookAppointmentSchema, editAppointmentSchema, appointmentListQuerySchema, availableSlotsQuerySchema } from "../utils/validation";
import { AuthRequest } from "../middleware/auth";
import { sendAppointmentBookedEmail, sendAppointmentCancelledEmail, sendAppointmentRescheduledEmail } from "../services/emailService";
import { toIdString } from "../utils/objectId.utils";
import { validatePaginationParams, buildPaginationResponse } from "../utils/pagination.utils";
import { buildAppointmentAggregationPipeline } from "../utils/query.utils";
import { formatAppointmentResponse, formatSlotResponse, formatDeletedAppointmentResponse } from "../utils/response.utils";
import { sendErrorResponse, ApiError } from "../utils/error.utils";
import { logError, logInfo } from "../utils/logger.utils";
import { AppointmentType } from "../enums/appointment.enums";

/**
 * Get all appointments for a user with pagination support
 * Uses MongoDB aggregation pipeline for efficient filtering and sorting
 */
export async function getAppointments(req: Request, res: Response) {
  try {
    // Validate query parameters
    const validatedQuery = appointmentListQuerySchema.parse(req.query);
    const { sharableId, type, page, limit } = validatedQuery;

    // Find user by sharableId
    const user = await User.findOne({ sharableId });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const now = new Date();
    const { skip } = validatePaginationParams(page, limit);

    // Build and execute aggregation pipeline
    const pipeline = buildAppointmentAggregationPipeline(user._id as Types.ObjectId, type as AppointmentType, now, skip, limit);
    const result = await Appointment.aggregate(pipeline);

    // Extract data and metadata from facet result
    const total = result[0]?.metadata[0]?.total || 0;
    const appointments = result[0]?.data || [];

    // Format appointments for response
    const formattedAppointments = appointments.map(formatAppointmentResponse);

    // Build pagination response
    const pagination = buildPaginationResponse(page, limit, total);

    res.json({
      appointments: formattedAppointments,
      pagination,
    });
  } catch (error: unknown) {
    logError("Get appointments error", error);
    sendErrorResponse(res, error, "Failed to fetch appointments");
  }
}

/**
 * Get available slots for a user for the current week
 * Accepts sharableId in query and weekOffset to navigate weeks
 * Returns slots grouped by day of week
 */
export async function getAvailableSlots(req: Request, res: Response) {
  try {
    const validatedQuery = availableSlotsQuerySchema.parse(req.query);
    const { sharableId, weekOffset } = validatedQuery;

    // Find user by sharableId
    const user = await User.findOne({ sharableId });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Calculate week start (Monday)
    const today = new Date();
    const dayOfWeek = today.getUTCDay();
    const monday = new Date(today);
    monday.setUTCDate(today.getUTCDate() - ((dayOfWeek + 6) % 7) + weekOffset * 7);
    monday.setUTCHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 7);

    // Get all slots for this week (both booked and available)
    const allSlots = await Slot.find({
      userId: user._id,
      date: { $gte: monday, $lt: sunday },
      startTime: { $gte: new Date() }, // Only future slots
    })
      .sort({ startTime: 1 })
      .lean();

    // Group slots by day of week
    const slotsByDay: Record<number, Array<Record<string, unknown>>> = {};

    allSlots.forEach((slot) => {
      const slotDate = new Date(slot.startTime);
      const dayId = slotDate.getUTCDay(); // 0=Sunday, 1=Monday, etc.

      if (!slotsByDay[dayId]) {
        slotsByDay[dayId] = [];
      }

      slotsByDay[dayId].push(formatSlotResponse(slot));
    });

    // Convert to array format sorted by dayId
    const result = Object.keys(slotsByDay)
      .map((dayId) => ({
        dayId: parseInt(dayId),
        slots: slotsByDay[parseInt(dayId)],
      }))
      .sort((a, b) => a.dayId - b.dayId);

    res.json(result);
  } catch (error: unknown) {
    logError("Get available slots error", error);
    sendErrorResponse(res, error, "Failed to fetch available slots");
  }
}

/**
 * Create appointment by booking a slot
 * Client sends sharableId and slot id in the request body
 */
export async function createAppointment(req: Request, res: Response) {
  try {
    const validatedData = bookAppointmentSchema.parse(req.body);
    const { sharableId } = req.body;

    // Find user by sharableId
    const user = await User.findOne({ sharableId });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Find the slot
    const slot = await Slot.findById(validatedData.slotId);
    if (!slot) {
      throw new ApiError(404, "Slot not found");
    }

    // Check if slot belongs to the specified user
    if (slot.userId.toString() !== toIdString(user._id)) {
      throw new ApiError(400, "Slot does not belong to this user");
    }

    // Check if slot is already booked
    if (slot.isBooked) {
      throw new ApiError(400, "Slot is already booked");
    }

    // Check if slot is in the future
    if (slot.startTime < new Date()) {
      throw new ApiError(400, "Cannot book a past slot");
    }

    // Create appointment
    const appointment = new Appointment({
      userId: user._id,
      slotId: slot._id,
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      guests: validatedData.guests || [],
      reason: validatedData.reason,
      status: "pending",
    });

    await appointment.save();

    // Update slot status
    slot.isBooked = true;
    await slot.save();

    // Populate slot for response
    const populatedAppointment = await Appointment.findById(appointment._id).populate<{ slotId: ISlot }>("slotId").lean();

    if (!populatedAppointment) {
      throw new ApiError(500, "Failed to create appointment");
    }

    // Send booking confirmation email to all guests
    await sendAppointmentBookedEmail({
      appointmentId: toIdString(appointment._id),
      ownerName: user.name,
      ownerEmail: user.email,
      guestName: appointment.name,
      guestEmail: appointment.email,
      startTime: slot.startTime,
      endTime: slot.endTime,
      reason: appointment.reason,
      guests: appointment.guests,
    });

    logInfo(`Appointment created: ${toIdString(appointment._id)} for user ${toIdString(user._id)}`);

    res.status(201).json(formatAppointmentResponse(populatedAppointment));
  } catch (error: unknown) {
    logError("Create appointment error", error);
    sendErrorResponse(res, error, "Failed to create appointment");
  }
}

/**
 * Delete appointment (soft delete)
 * Mark isDeleted as true and update slot.isBooked as false
 */
export async function deleteAppointment(req: AuthRequest, res: Response) {
  try {
    const appointment = await Appointment.findById(req.params.id).populate<{ slotId: ISlot }>("slotId");

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    // Verify ownership
    if (appointment.userId.toString() !== req.userId) {
      throw new ApiError(403, "Forbidden");
    }

    // Check if already deleted
    if (appointment.isDeleted) {
      throw new ApiError(400, "Appointment already deleted");
    }

    const slot = appointment.slotId;

    // Check if slot is in the future
    if (slot.startTime < new Date()) {
      throw new ApiError(400, "Cannot delete a past appointment");
    }

    // Get user info for email
    const user = await User.findById(req.userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Soft delete appointment
    appointment.isDeleted = true;
    await appointment.save();

    // Update slot status
    await Slot.findByIdAndUpdate(slot._id, { isBooked: false });

    // Send cancellation email to all guests
    await sendAppointmentCancelledEmail({
      appointmentId: toIdString(appointment._id),
      ownerName: user.name,
      ownerEmail: user.email,
      guestName: appointment.name,
      guestEmail: appointment.email,
      startTime: slot.startTime,
      endTime: slot.endTime,
      reason: appointment.reason,
      guests: appointment.guests,
    });

    logInfo(`Appointment deleted: ${toIdString(appointment._id)}`);

    res.json({
      message: "Appointment deleted successfully",
      appointment: formatDeletedAppointmentResponse(appointment, slot),
    });
  } catch (error: unknown) {
    logError("Delete appointment error", error);
    sendErrorResponse(res, error, "Failed to delete appointment");
  }
}

/**
 * Edit/Reschedule appointment - can update slot, guest info, or both
 * Only calendar owner (authenticated user) can edit appointments
 */
export async function editAppointment(req: AuthRequest, res: Response) {
  try {
    const validatedData = editAppointmentSchema.parse(req.body);
    const appointmentId = req.params.id;

    // Check if at least one field is provided
    if (
      !validatedData.newSlotId &&
      !validatedData.name &&
      !validatedData.email &&
      validatedData.phone === undefined &&
      !validatedData.guests &&
      !validatedData.reason
    ) {
      throw new ApiError(400, "At least one field must be provided to update");
    }

    // Find the appointment with populated slot
    const appointment = await Appointment.findById(appointmentId).populate<{ slotId: ISlot }>("slotId");

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    // Verify ownership - only the calendar owner can edit
    if (appointment.userId.toString() !== req.userId) {
      throw new ApiError(403, "Forbidden");
    }

    // Check if already deleted
    if (appointment.isDeleted) {
      throw new ApiError(400, "Cannot edit a deleted appointment");
    }

    const oldSlot = appointment.slotId;

    // Check if old slot is in the future
    if (oldSlot.startTime < new Date()) {
      throw new ApiError(400, "Cannot edit a past appointment");
    }

    // Get user info for email
    const user = await User.findById(req.userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    let isSlotChanged = false;
    let newSlot: ISlot | null = null;
    let oldStartTime = oldSlot.startTime;
    let oldEndTime = oldSlot.endTime;

    // Handle slot change if newSlotId is provided
    if (validatedData.newSlotId) {
      // Find the new slot
      newSlot = await Slot.findById(validatedData.newSlotId);
      if (!newSlot) {
        throw new ApiError(404, "New slot not found");
      }

      // Check if new slot belongs to the same user
      if (newSlot.userId.toString() !== req.userId) {
        throw new ApiError(400, "New slot does not belong to this user");
      }

      // Check if new slot is already booked
      if (newSlot.isBooked) {
        throw new ApiError(400, "New slot is already booked");
      }

      // Check if new slot is in the future
      if (newSlot.startTime < new Date()) {
        throw new ApiError(400, "Cannot book a past slot");
      }

      // Check if new slot is different from old slot
      if (toIdString(oldSlot._id) === toIdString(newSlot._id)) {
        throw new ApiError(400, "New slot must be different from current slot");
      }

      isSlotChanged = true;
    }

    // Update appointment fields
    if (validatedData.name !== undefined) {
      appointment.name = validatedData.name;
    }
    if (validatedData.email !== undefined) {
      appointment.email = validatedData.email;
    }
    if (validatedData.phone !== undefined) {
      appointment.phone = validatedData.phone;
    }
    if (validatedData.guests !== undefined) {
      appointment.guests = validatedData.guests;
    }
    if (validatedData.reason !== undefined) {
      appointment.reason = validatedData.reason;
    }

    // Handle slot change
    if (isSlotChanged && newSlot) {
      // Update old slot - mark as available
      await Slot.findByIdAndUpdate(oldSlot._id, { isBooked: false });

      // Update new slot - mark as booked
      newSlot.isBooked = true;
      await newSlot.save();

      // Update appointment with new slot - use explicit type casting
      (appointment as unknown as { slotId: Types.ObjectId }).slotId = newSlot._id as Types.ObjectId;
    }

    await appointment.save();

    // Populate the updated appointment
    const updatedAppointment = await Appointment.findById(appointment._id).populate<{ slotId: ISlot }>("slotId").lean();

    if (!updatedAppointment) {
      throw new ApiError(500, "Failed to update appointment");
    }

    // Send appropriate email based on what was changed
    if (isSlotChanged && newSlot) {
      // Send reschedule email if slot was changed
      await sendAppointmentRescheduledEmail({
        appointmentId: toIdString(appointment._id),
        ownerName: user.name,
        ownerEmail: user.email,
        guestName: updatedAppointment.name,
        guestEmail: updatedAppointment.email,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        oldStartTime: oldStartTime,
        oldEndTime: oldEndTime,
        reason: updatedAppointment.reason,
        guests: updatedAppointment.guests,
      });
    }

    logInfo(`Appointment updated: ${toIdString(appointment._id)}, slot changed: ${isSlotChanged}`);

    res.json({
      message: isSlotChanged ? "Appointment rescheduled successfully" : "Appointment updated successfully",
      appointment: formatAppointmentResponse(updatedAppointment),
    });
  } catch (error: unknown) {
    logError("Edit appointment error", error);
    sendErrorResponse(res, error, "Failed to update appointment");
  }
}
