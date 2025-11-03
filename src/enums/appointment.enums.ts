/**
 * Appointment type enum for filtering past and future appointments
 */
export enum AppointmentType {
  PAST = "past",
  FUTURE = "future",
}

/**
 * Appointment status enum
 */
export enum AppointmentStatus {
  PENDING = "pending",
  DONE = "done",
}

/**
 * Sort order enum for database queries
 */
export enum SortOrder {
  ASC = 1,
  DESC = -1,
}

