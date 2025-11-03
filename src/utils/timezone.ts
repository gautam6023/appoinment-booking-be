/**
 * Parse UTC offset string (e.g., "+05:30", "-08:00") into hours and minutes
 * @param offset - UTC offset string in format [+-]HH:MM
 * @returns Object with hours and minutes as numbers
 */
export function parseTimezoneOffset(offset: string): { hours: number; minutes: number } {
  const sign = offset[0] === "+" ? 1 : -1;
  const [hoursStr, minutesStr] = offset.slice(1).split(":");
  const hours = parseInt(hoursStr, 10) * sign;
  const minutes = parseInt(minutesStr, 10) * sign;
  
  return { hours, minutes };
}

/**
 * Convert local time to UTC by subtracting the timezone offset
 * Formula: UTC time = Local time - offset
 * @param localHour - Local hour (0-23)
 * @param localMinute - Local minute (0-59)
 * @param timezoneOffset - UTC offset string (e.g., "+05:30")
 * @returns Object with UTC hour and minute, and day adjustment (-1, 0, or 1)
 */
export function convertLocalToUTC(
  localHour: number,
  localMinute: number,
  timezoneOffset: string
): { utcHour: number; utcMinute: number; dayAdjustment: number } {
  const { hours: offsetHours, minutes: offsetMinutes } = parseTimezoneOffset(timezoneOffset);

  // Convert local time to minutes since midnight
  let totalMinutes = localHour * 60 + localMinute;
  
  // Subtract offset to get UTC (UTC = Local - offset)
  totalMinutes -= offsetHours * 60 + offsetMinutes;

  // Calculate day adjustment
  let dayAdjustment = 0;
  if (totalMinutes < 0) {
    dayAdjustment = -1;
    totalMinutes += 24 * 60; // Add 24 hours
  } else if (totalMinutes >= 24 * 60) {
    dayAdjustment = 1;
    totalMinutes -= 24 * 60; // Subtract 24 hours
  }

  const utcHour = Math.floor(totalMinutes / 60);
  const utcMinute = totalMinutes % 60;

  return { utcHour, utcMinute, dayAdjustment };
}

/**
 * Get UTC working hours from local working hours based on timezone offset
 * @param timezoneOffset - UTC offset string (e.g., "+05:30")
 * @returns Object with UTC start and end times
 */
export function getUTCWorkingHours(timezoneOffset: string): {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  startDayAdjustment: number;
  endDayAdjustment: number;
} {
  const LOCAL_START_HOUR = 9; // 9 AM local
  const LOCAL_END_HOUR = 17; // 5 PM local

  const start = convertLocalToUTC(LOCAL_START_HOUR, 0, timezoneOffset);
  const end = convertLocalToUTC(LOCAL_END_HOUR, 0, timezoneOffset);

  return {
    startHour: start.utcHour,
    startMinute: start.utcMinute,
    endHour: end.utcHour,
    endMinute: end.utcMinute,
    startDayAdjustment: start.dayAdjustment,
    endDayAdjustment: end.dayAdjustment,
  };
}

