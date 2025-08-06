import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { User } from '@domain/entities/User';
import { ApiErrorCode, ApiSuccessCode } from '@domain/types/apiCodes';

export class ApiError extends Error {
  data: unknown;
  code: ApiErrorCode | ApiSuccessCode;
  success: boolean;

  constructor({ message, data, code, success = false }: ApiResponse<unknown>) {
    super(message?.trim() ? message : ApiErrorCodes.UNKNOWN_ERROR);
    this.data = data;
    this.code = code;
    this.success = success;
  }
}

export type ApiPromise<T = unknown> = Promise<ApiResponse<T>>;

/**
 * Base structure for all API responses
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  code: ApiErrorCode | ApiSuccessCode;
  message: string;
  timestamp: string;
  requestId: string;
  meta?: Record<string, unknown>;
}

/**
 * Success response
 */
export interface ApiSuccessResponse<T> extends ApiResponse<T> {
  success: true;
  data: T | null;
  code: ApiSuccessCode;
  message: string;
  timestamp: string;
  requestId: string;
}

/**
 * Typed error response
 */
export interface ApiErrorResponse<T> extends ApiResponse<T> {
  success: false;
  data: T | null;
  code: ApiErrorCode;
  message: string;
  timestamp: string;
  requestId: string;
  error?: {
    type?: 'validation' | 'network' | 'server' | 'authentication' | 'authorization' | 'business';
    details?: Array<{
      field: string;
      code: string;
      message: string;
    }>;
    stack?: string;
  };
}

/**
 * Login
 */
export type LoginPayload = Pick<User, 'email' | 'password'>;

/**
 * Register
 */
export type RegisterPayload = Omit<User, 'id' | 'role' | 'createdAt' | 'updatedAt'>;

/**
 * Forgot password
 */
export type ForgotPasswordPayload = Pick<User, 'email'>;

/**
 * Reset password
 */
export type ResetPasswordPayload = Pick<User, 'password'> & { token: string };

/**
 * Resend verification
 */
export interface ResendVerificationPayload {
  identifier: string;
}

/**
 * Verify email
 */
export interface VerifyEmailPayload {
  token: string;
}

/**
 * Email verification response
 */
export interface EmailVerificationResponse {
  status: string;
  message: string;
  resendRequired?: boolean;
}

/**
 * Validate reset token
 */
export interface ValidateResetTokenPayload {
  token: string;
}

/**
 * Reset token validation response
 */
export interface ResetTokenValidationResponse {
  isValid: boolean;
  isExpired?: boolean;
  userExists?: boolean;
}
