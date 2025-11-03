import { Types, PipelineStage } from "mongoose";
import { AppointmentType, SortOrder } from "../enums/appointment.enums";

/**
 * Build MongoDB aggregation pipeline for appointments with filtering, sorting, and pagination
 * @param userId - User's ObjectId
 * @param type - Appointment type (past or future)
 * @param now - Current date/time for comparison
 * @param skip - Number of documents to skip
 * @param limit - Maximum number of documents to return
 * @returns Array of pipeline stages
 */
export function buildAppointmentAggregationPipeline(
  userId: Types.ObjectId,
  type: AppointmentType,
  now: Date,
  skip: number,
  limit: number
): PipelineStage[] {
  const isPast = type === AppointmentType.PAST;
  const sortOrder = isPast ? SortOrder.DESC : SortOrder.ASC;
  const timeComparison = isPast ? { $lt: now } : { $gte: now };

  return [
    // Match appointments for this user that are not deleted
    {
      $match: {
        userId: userId,
        isDeleted: false,
      },
    },
    // Join with slots collection
    {
      $lookup: {
        from: "slots",
        localField: "slotId",
        foreignField: "_id",
        as: "slotData",
      },
    },
    // Unwind the slot array (should only be one)
    {
      $unwind: {
        path: "$slotData",
        preserveNullAndEmptyArrays: false,
      },
    },
    // Filter based on slot startTime (past or future)
    {
      $match: {
        "slotData.startTime": timeComparison,
      },
    },
    // Sort by slot startTime
    {
      $sort: {
        "slotData.startTime": sortOrder,
      },
    },
    // Use facet to get both data and count in one query
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ];
}

/**
 * Build query for finding slots within a date range
 * @param userId - User's ObjectId
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @param isFuture - Whether to only include future slots
 * @returns MongoDB query object
 */
export function buildSlotQuery(
  userId: Types.ObjectId,
  startDate: Date,
  endDate: Date,
  isFuture: boolean = false
): Record<string, unknown> {
  const query: Record<string, unknown> = {
    userId,
    date: { $gte: startDate, $lte: endDate },
  };

  if (isFuture) {
    query.startTime = { $gte: new Date() };
  }

  return query;
}

/**
 * Build query to check for existing slots to prevent duplicates
 * @param userId - User's ObjectId
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns MongoDB query object
 */
export function buildExistingSlotCheckQuery(userId: Types.ObjectId, startDate: Date, endDate: Date): Record<string, unknown> {
  return {
    userId,
    date: { $gte: startDate, $lte: endDate },
  };
}

