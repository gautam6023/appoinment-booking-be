/**
 * Log levels
 */
export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

/**
 * Format log message with timestamp and level
 * @param level - Log level
 * @param message - Log message
 * @param meta - Additional metadata
 * @returns Formatted log string
 */
function formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

/**
 * Log info message
 * @param message - Log message
 * @param meta - Additional metadata
 */
export function logInfo(message: string, meta?: Record<string, unknown>): void {
  console.log(formatLog(LogLevel.INFO, message, meta));
}

/**
 * Log warning message
 * @param message - Log message
 * @param meta - Additional metadata
 */
export function logWarn(message: string, meta?: Record<string, unknown>): void {
  console.warn(formatLog(LogLevel.WARN, message, meta));
}

/**
 * Log error message
 * @param message - Log message
 * @param error - Error object
 * @param meta - Additional metadata
 */
export function logError(message: string, error?: unknown, meta?: Record<string, unknown>): void {
  const errorMeta = error instanceof Error ? { error: error.message, stack: error.stack, ...meta } : meta;
  console.error(formatLog(LogLevel.ERROR, message, errorMeta));
}

/**
 * Log debug message (only in development)
 * @param message - Log message
 * @param meta - Additional metadata
 */
export function logDebug(message: string, meta?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== "production") {
    console.log(formatLog(LogLevel.DEBUG, message, meta));
  }
}

/**
 * Log with custom level
 * @param level - Log level
 * @param message - Log message
 * @param meta - Additional metadata
 */
export function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const formatted = formatLog(level, message, meta);
  switch (level) {
    case LogLevel.ERROR:
      console.error(formatted);
      break;
    case LogLevel.WARN:
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

