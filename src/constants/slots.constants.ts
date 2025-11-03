/**
 * Fixed working days (Monday to Friday)
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export const FIXED_WORKDAYS = [1, 2, 3, 4, 5] as const;

/**
 * Local working hours (9 AM - 5 PM in user's timezone)
 */
export const LOCAL_START_HOUR = 9;
export const LOCAL_END_HOUR = 17;

/**
 * Slot duration in minutes
 */
export const SLOT_DURATION_MINUTES = 30;

/**
 * Pagination defaults
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

/**
 * Cron job schedule
 * Runs at 00:00 on the 15th day of every month
 */
export const MONTHLY_SLOT_GENERATION_SCHEDULE = "0 0 15 * *";

/**
 * Daily cleanup schedule
 * Runs at 02:00 every day
 */
export const DAILY_CLEANUP_SCHEDULE = "0 2 * * *";

