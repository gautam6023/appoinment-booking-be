import { Types } from "mongoose";
import { Slot } from "../models/Slot";
import { User } from "../models/User";
import { getUTCWorkingHours } from "../utils/timezone";
import { getMonthEnd, addMonths, getFurthestDate } from "../utils/date.utils";
import { logInfo, logError, logWarn } from "../utils/logger.utils";
import { FIXED_WORKDAYS, SLOT_DURATION_MINUTES } from "../constants/slots.constants";

/**
 * Generate slots for a specific date range for a user
 * @param userId - The user's ObjectId
 * @param startDate - Start date (inclusive)
 * @param endDate - End date (inclusive)
 */
async function generateSlotsForDateRange(userId: Types.ObjectId | string, startDate: Date, endDate: Date): Promise<number> {
  const userObjectId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

  // Fetch user to get timezone
  const user = await User.findById(userObjectId);
  if (!user || !user.timezone) {
    throw new Error("User or timezone not found");
  }

  // Get UTC working hours based on user's timezone
  const { startHour, startMinute, endHour, endMinute, startDayAdjustment, endDayAdjustment } = getUTCWorkingHours(user.timezone);

  const slots = [];
  const currentDay = new Date(startDate);
  currentDay.setUTCHours(0, 0, 0, 0);

  const endDay = new Date(endDate);
  endDay.setUTCHours(23, 59, 59, 999);

  // Generate slots for each day in the range
  while (currentDay <= endDay) {
    const dayOfWeek = currentDay.getUTCDay();

    // Only generate slots for workdays
    if ((FIXED_WORKDAYS as readonly number[]).includes(dayOfWeek)) {
      // Calculate total minutes from start to end
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute + (endDayAdjustment - startDayAdjustment) * 24 * 60;

      for (let currentMinutes = startTotalMinutes; currentMinutes < endTotalMinutes; currentMinutes += SLOT_DURATION_MINUTES) {
        const dayAdjust = Math.floor(currentMinutes / (24 * 60));
        const minutesInDay = currentMinutes % (24 * 60);
        const hour = Math.floor(minutesInDay / 60);
        const minute = minutesInDay % 60;

        const slotStart = new Date(currentDay);
        slotStart.setUTCDate(currentDay.getUTCDate() + startDayAdjustment + dayAdjust);
        slotStart.setUTCHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setUTCMinutes(slotStart.getUTCMinutes() + SLOT_DURATION_MINUTES);

        const slotDate = new Date(currentDay);
        slotDate.setUTCHours(0, 0, 0, 0);

        // Only add future slots
        if (slotStart > new Date()) {
          slots.push({
            userId: userObjectId,
            startTime: slotStart,
            endTime: slotEnd,
            date: slotDate,
            isBooked: false,
          });
        }
      }
    }

    // Move to next day
    currentDay.setUTCDate(currentDay.getUTCDate() + 1);
  }

  // Check for existing slots to prevent duplicates
  if (slots.length > 0) {
    const existingSlots = await Slot.find({
      userId: userObjectId,
      startTime: {
        $in: slots.map((s) => s.startTime),
      },
    })
      .select("startTime")
      .lean();

    const existingStartTimes = new Set(existingSlots.map((s) => s.startTime.getTime()));

    // Filter out slots that already exist
    const newSlots = slots.filter((slot) => !existingStartTimes.has(slot.startTime.getTime()));

    // Bulk insert only new slots
    if (newSlots.length > 0) {
      try {
        await Slot.insertMany(newSlots, { ordered: false });
        logInfo(`Generated ${newSlots.length} new slots for user ${userObjectId}`);
        return newSlots.length;
      } catch (error: any) {
        // If there are duplicate key errors, some slots were already created
        // This is fine, we just skip them
        if (error.code === 11000) {
          const insertedCount = error.result?.nInserted || 0;
          logWarn(`Inserted ${insertedCount} slots, skipped duplicates for user ${userObjectId}`);
          return insertedCount;
        }
        throw error;
      }
    }

    logInfo(`No new slots to generate for user ${userObjectId} (all already exist)`);
    return 0;
  }

  return 0;
}

/**
 * Generate slots for a specific week for a user
 * Fixed schedule: Monday-Friday, 9 AM - 5 PM (in user's local time), 30-minute slots
 * @param userId - The user's ObjectId
 * @param weekStart - Start date of the week (should be Monday)
 */
export async function generateSlotsForWeek(userId: Types.ObjectId | string, weekStart: Date): Promise<void> {
  const monday = new Date(weekStart);
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  await generateSlotsForDateRange(userId, monday, sunday);
}

/**
 * Generate initial slots for a new user signup
 * Creates slots from signup date until end of NEXT month
 * Example: Signup on Nov 10 → slots until Dec 31
 * @param userId - The user's ObjectId
 */
export async function generateInitialSlots(userId: Types.ObjectId | string): Promise<void> {
  const userObjectId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Calculate end of next month
  const nextMonth = addMonths(today, 1);
  const endOfNextMonth = getMonthEnd(nextMonth);

  logInfo(`Generating initial slots for user ${userObjectId} from ${today.toISOString()} to ${endOfNextMonth.toISOString()}`);

  await generateSlotsForDateRange(userObjectId, today, endOfNextMonth);
}

/**
 * Delete past unbooked slots
 * This should be run as a cron job daily
 */
export async function deletePastUnbookedSlots(): Promise<number> {
  const now = new Date();

  const result = await Slot.deleteMany({
    endTime: { $lt: now },
    isBooked: false,
  });

  const deletedCount = result.deletedCount || 0;
  logInfo(`Deleted ${deletedCount} past unbooked slots`);
  return deletedCount;
}

/**
 * Generate slots for all users with sliding window approach
 * Runs on 15th of every month
 * For each user:
 * - Check furthest slot date
 * - If furthest slot < end of next month, generate missing slots
 * Example: On Nov 15, if user has slots until Dec 10, generate Dec 11-Jan 31
 */
export async function generateMonthlySlots(): Promise<void> {
  logInfo("Starting monthly slot generation for all users...");

  const users = await User.find().lean();
  let totalGenerated = 0;

  for (const user of users) {
    try {
      const userId = user._id as Types.ObjectId;

      // Find the furthest slot for this user
      const furthestSlot = await Slot.findOne({ userId }).sort({ date: -1 }).select("date").lean();

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // Calculate end of next month from today
      const nextMonth = addMonths(today, 1);
      const endOfNextMonth = getMonthEnd(nextMonth);

      let startDate: Date;

      if (!furthestSlot) {
        // No slots exist, generate from today
        startDate = today;
        logInfo(`No existing slots for user ${userId}, generating from today`);
      } else {
        const furthestDate = new Date(furthestSlot.date);
        furthestDate.setUTCHours(0, 0, 0, 0);

        // If furthest slot is before end of next month, generate missing slots
        if (furthestDate < endOfNextMonth) {
          // Start generating from day after furthest slot
          startDate = new Date(furthestDate);
          startDate.setUTCDate(furthestDate.getUTCDate() + 1);
          logInfo(
            `User ${userId} has slots until ${furthestDate.toISOString()}, generating from ${startDate.toISOString()} to ${endOfNextMonth.toISOString()}`
          );
        } else {
          logInfo(`User ${userId} already has slots until ${furthestDate.toISOString()}, skipping`);
          continue;
        }
      }

      const generated = await generateSlotsForDateRange(userId, startDate, endOfNextMonth);
      totalGenerated += generated;
    } catch (error) {
      logError(`Failed to generate slots for user ${user._id}`, error);
    }
  }

  logInfo(`Monthly slot generation completed. Total slots generated: ${totalGenerated}`);
}
