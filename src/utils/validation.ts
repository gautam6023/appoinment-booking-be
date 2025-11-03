import { z } from "zod";
import { AppointmentType, AppointmentStatus } from "../enums/appointment.enums";
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from "../constants/slots.constants";

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  timezone: z.string().regex(/^[+-]\d{2}:\d{2}$/, "Timezone must be in UTC offset format (e.g., +05:30, -08:00)"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const bookAppointmentSchema = z.object({
  sharableId: z.string().min(1, "Sharable ID is required"),
  slotId: z.string().min(1, "Slot ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  guests: z.array(z.string()).optional(),
  reason: z.string().max(500, "Reason must be at most 500 characters").optional(),
});

export const editAppointmentSchema = z.object({
  newSlotId: z.string().min(1, "New slot ID is required").optional(),
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  guests: z.array(z.string()).optional(),
  reason: z.string().max(500, "Reason must be at most 500 characters").optional(),
});

/**
 * Validation schema for pagination query parameters
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .or(z.number())
    .optional()
    .transform((val) => (val ? parseInt(String(val), 10) : DEFAULT_PAGE)),
  limit: z
    .string()
    .or(z.number())
    .optional()
    .transform((val) => {
      const parsed = val ? parseInt(String(val), 10) : DEFAULT_LIMIT;
      return Math.min(parsed, MAX_LIMIT);
    }),
});

/**
 * Validation schema for appointment list query parameters
 */
export const appointmentListQuerySchema = z.object({
  sharableId: z.string().min(1, "sharableId is required"),
  type: z.nativeEnum(AppointmentType).refine((val) => val === AppointmentType.PAST || val === AppointmentType.FUTURE, {
    message: "type must be either 'past' or 'future'",
  }),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : DEFAULT_PAGE)),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = val ? parseInt(val, 10) : DEFAULT_LIMIT;
      return Math.min(parsed, MAX_LIMIT);
    }),
});

/**
 * Validation schema for available slots query parameters
 */
export const availableSlotsQuerySchema = z.object({
  sharableId: z.string().min(1, "sharableId is required"),
  weekOffset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0)),
});

/**
 * Validation schema for appointment status updates
 */
export const appointmentStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus).refine((val) => val === AppointmentStatus.PENDING || val === AppointmentStatus.DONE, {
    message: "status must be either 'pending' or 'done'",
  }),
});
