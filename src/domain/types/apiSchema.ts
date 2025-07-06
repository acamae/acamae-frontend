import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { User } from '@domain/entities/User';
import { ApiErrorCode, ApiSuccessCode } from '@domain/types/apiCodes';

export class ApiError extends Error {
  data: unknown;
  status: number;
  code: ApiErrorCode | ApiSuccessCode;
  success: boolean;

  constructor({ message, data, status, code, success = false }: ApiResponse<unknown>) {
    super(message ?? ApiErrorCodes.UNKNOWN_ERROR);
    this.data = data;
    this.status = status;
    this.code = code;
    this.success = success;
  }
}

export type ApiPromise<T = unknown> = Promise<ApiResponse<T>>;

/**
 * Api response
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  status: number;
  message?: string;
  code: ApiErrorCode | ApiSuccessCode;
}

export interface ApiSuccessResponse<T> extends ApiResponse<T> {
  success: true;
  data: T | null;
  code: ApiSuccessCode;
}

export interface ApiErrorResponse<T> extends ApiResponse<T> {
  success: false;
  data: T | null;
  code: ApiErrorCode;
  message: string;
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
 * Email verification status
 */
export enum EmailVerificationStatus {
  SUCCESS = 'success',
  INVALID_TOKEN = 'invalid_token',
  EXPIRED_TOKEN = 'expired_token',
  ALREADY_VERIFIED = 'already_verified',
  UPDATE_FAILED = 'update_failed',
}

/**
 * Email verification response
 */
export interface EmailVerificationResponse {
  status: EmailVerificationStatus;
  message: string;
  resendRequired?: boolean;
}
