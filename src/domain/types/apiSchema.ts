import { User } from '@domain/entities/User';

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
