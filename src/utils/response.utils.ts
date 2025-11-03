import { toIdString } from "./objectId.utils";

/**
 * Format appointment document for API response
 * @param appointment - Appointment document with populated slot
 * @returns Formatted appointment object
 */
export function formatAppointmentResponse(appointment: any): Record<string, unknown> {
  const slotData = appointment.slotData || appointment.slotId;

  return {
    _id: toIdString(appointment._id),
    userId: toIdString(appointment.userId),
    slotId: toIdString(slotData._id),
    name: appointment.name,
    email: appointment.email,
    phone: appointment.phone,
    guests: appointment.guests,
    reason: appointment.reason,
    status: appointment.status,
    slot: {
      startTime: slotData.startTime.toISOString(),
      endTime: slotData.endTime.toISOString(),
      date: slotData.date.toISOString(),
    },
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  };
}

/**
 * Format slot document for API response
 * @param slot - Slot document
 * @returns Formatted slot object
 */
export function formatSlotResponse(slot: any): Record<string, unknown> {
  return {
    _id: toIdString(slot._id),
    startTime: slot.startTime.toISOString(),
    endTime: slot.endTime.toISOString(),
    date: slot.date.toISOString(),
    isBooked: slot.isBooked,
  };
}

/**
 * Format user document for API response (excludes password)
 * @param user - User document
 * @returns Formatted user object
 */
export function formatUserResponse(user: any): Record<string, unknown> {
  return {
    id: toIdString(user._id),
    email: user.email,
    name: user.name,
    userId: user.userId,
    sharableId: user.sharableId,
    timezone: user.timezone,
  };
}

/**
 * Format appointment for response after deletion
 * @param appointment - Appointment document with slot
 * @returns Formatted deleted appointment object
 */
export function formatDeletedAppointmentResponse(appointment: any, slot: any): Record<string, unknown> {
  return {
    _id: toIdString(appointment._id),
    userId: toIdString(appointment.userId),
    slotId: toIdString(slot._id),
    name: appointment.name,
    email: appointment.email,
    phone: appointment.phone,
    guests: appointment.guests,
    reason: appointment.reason,
    status: appointment.status,
    isDeleted: appointment.isDeleted,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  };
}

