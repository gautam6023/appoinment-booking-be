import { Types } from "mongoose";

type ObjectIdType = Types.ObjectId | { toString(): string };

/**
 * Convert various ObjectId types to string
 * @param id - ObjectId or string
 * @returns String representation of the ID
 */
export function toIdString(id: unknown): string {
  if (typeof id === "string") return id;
  if (id && typeof id === "object" && "toString" in id) {
    return (id as ObjectIdType).toString();
  }
  return String(id);
}

/**
 * Convert string to ObjectId
 * @param id - String representation of ObjectId
 * @returns ObjectId instance
 */
export function toObjectId(id: string): Types.ObjectId {
  return new Types.ObjectId(id);
}

/**
 * Check if a string is a valid ObjectId
 * @param id - String to validate
 * @returns True if valid ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

