import { User } from '@domain/entities/User';

export class ApiError extends Error {
  status?: number;
  success?: boolean;
  code?: string;
  data?: unknown;
  message: string;

  constructor({
    success,
    message,
    status,
    code,
    data,
  }: {
    success: boolean;
    message?: string;
    status?: number;
    code?: string;
    data?: unknown;
  }) {
    super(message);
    this.success = success;
    this.message = message ?? 'An unknown error occurred';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export type ApiPromise<T = unknown> = Promise<ApiResponse<T>>;

/**
 * Api response
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  status?: number;
  message?: string;
  code?: string;
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
export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

/**
 * Resend verification
 */
export interface ResendVerificationPayload {
  identifier: string;
}
