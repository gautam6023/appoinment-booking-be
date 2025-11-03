import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from "../constants/slots.constants";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Validate and normalize pagination parameters
 * @param page - Page number from query
 * @param limit - Limit from query
 * @returns Validated pagination parameters with skip value
 */
export function validatePaginationParams(page?: string | number, limit?: string | number): PaginationParams {
  const validPage = Math.max(1, parseInt(String(page || DEFAULT_PAGE), 10) || DEFAULT_PAGE);
  const validLimit = Math.min(MAX_LIMIT, Math.max(1, parseInt(String(limit || DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
  const skip = (validPage - 1) * validLimit;

  return {
    page: validPage,
    limit: validLimit,
    skip,
  };
}

/**
 * Build pagination response metadata
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Pagination response object
 */
export function buildPaginationResponse(page: number, limit: number, total: number): PaginationResponse {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

