import { ApiErrorCode, ApiSuccessCode } from '@domain/constants/apiCodes';
import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { User } from '@domain/entities/User';

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
  data: null;
  success: false;
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
