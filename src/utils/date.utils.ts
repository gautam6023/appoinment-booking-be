/**
 * Get the start of the month for a given date (00:00:00.000)
 * @param date - Input date
 * @returns Date at the start of the month
 */
export function getMonthStart(date: Date): Date {
  const result = new Date(date);
  result.setUTCDate(1);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of the month for a given date (23:59:59.999)
 * @param date - Input date
 * @returns Date at the end of the month
 */
export function getMonthEnd(date: Date): Date {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + 1, 0);
  result.setUTCHours(23, 59, 59, 999);
  return result;
}

/**
 * Get the start of the week (Monday) for a given date
 * @param date - Input date
 * @returns Date at the start of the week (Monday 00:00:00.000)
 */
export function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const dayOfWeek = result.getUTCDay();
  const daysToMonday = (dayOfWeek + 6) % 7; // 0 for Monday, 1 for Tuesday, etc.
  result.setUTCDate(result.getUTCDate() - daysToMonday);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of the week (Sunday) for a given date
 * @param date - Input date
 * @returns Date at the end of the week (Sunday 23:59:59.999)
 */
export function getWeekEnd(date: Date): Date {
  const monday = getWeekStart(date);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Add months to a date
 * @param date - Input date
 * @param months - Number of months to add (can be negative)
 * @returns New date with months added
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

/**
 * Check if a date is in the future
 * @param date - Date to check
 * @returns True if date is after current time
 */
export function isFutureDate(date: Date): boolean {
  return date > new Date();
}

/**
 * Get the furthest date from an array of dates
 * @param dates - Array of dates
 * @returns The latest date or null if array is empty
 */
export function getFurthestDate(dates: Date[]): Date | null {
  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

/**
 * Check if two dates are in the same day (UTC)
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if both dates are on the same UTC day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}

