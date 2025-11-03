interface SlotOptions {
  workdays?: number[];
  startHour?: number;
  endHour?: number;
}

// Generate time slots for a week (defaults: Mon-Fri, 9 AM - 5 PM UTC)
export function generateTimeSlotsForWeek(weekStart: Date, options: SlotOptions = {}): Date[] {
  const slots: Date[] = [];

  const workdays = options.workdays ?? [1, 2, 3, 4, 5];
  const startHour = options.startHour ?? 9;
  const endHour = options.endHour ?? 17;

  const monday = new Date(weekStart);
  monday.setUTCHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const day = new Date(monday);
    day.setUTCDate(monday.getUTCDate() + dayOffset);

    if (!workdays.includes(day.getUTCDay())) {
      continue;
    }

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slot = new Date(day);
        slot.setUTCHours(hour, minute, 0, 0);
        slots.push(slot);
      }
    }
  }

  return slots;
}

// Convert local time to UTC (for server timezone)
export function convertToUTC(date: Date): Date {
  // Date objects in JavaScript are already stored in UTC internally
  // When we create a Date from ISO string, it's already in UTC
  return new Date(date.toISOString());
}

// Check if a time slot overlaps with existing appointments
export function isSlotAvailable(startTime: Date, endTime: Date, existingAppointments: { startTime: Date; endTime: Date }[]): boolean {
  for (const appointment of existingAppointments) {
    // Check for overlap
    if (startTime < appointment.endTime && endTime > appointment.startTime) {
      return false;
    }
  }
  return true;
}
