import { Response } from "express";
import { ZodError } from "zod";

/**
 * Custom API Error class with status code
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Format Zod validation errors into a user-friendly message
 * @param error - ZodError instance
 * @returns Formatted error message
 */
export function handleZodError(error: ZodError): string {
  const issues = error.issues;
  if (issues && issues.length > 0) {
    return issues[0].message;
  }
  return "Validation error";
}

/**
 * Check if error is a Zod validation error
 * @param error - Error object
 * @returns True if error is ZodError
 */
export function isZodError(error: unknown): error is ZodError {
  return error !== null && typeof error === "object" && "name" in error && error.name === "ZodError";
}

/**
 * Handle MongoDB errors and return appropriate status code and message
 * @param error - MongoDB error
 * @returns Object with status code and message
 */
export function handleMongoError(error: any): { statusCode: number; message: string } {
  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    return {
      statusCode: 400,
      message: `${field || "Field"} already exists`,
    };
  }

  // Validation error
  if (error.name === "ValidationError") {
    return {
      statusCode: 400,
      message: error.message,
    };
  }

  // Cast error (invalid ObjectId)
  if (error.name === "CastError") {
    return {
      statusCode: 400,
      message: "Invalid ID format",
    };
  }

  return {
    statusCode: 500,
    message: "Database error",
  };
}

/**
 * Send error response with consistent format
 * @param res - Express response object
 * @param error - Error object
 * @param defaultMessage - Default message if error is unknown
 */
export function sendErrorResponse(res: Response, error: unknown, defaultMessage: string = "Internal server error"): void {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (isZodError(error)) {
    res.status(400).json({ error: handleZodError(error) });
    return;
  }

  if (error && typeof error === "object" && "code" in error) {
    const mongoError = handleMongoError(error);
    res.status(mongoError.statusCode).json({ error: mongoError.message });
    return;
  }

  res.status(500).json({ error: defaultMessage });
}

