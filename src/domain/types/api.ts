import { UserRole } from '@domain/constants/user';

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  role?: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * HTTP status codes for successful responses
 */
export const ApiSuccessCodes = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
} as const;

/**
 * HTTP status codes for error responses
 */
export const ApiErrorCodes = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
