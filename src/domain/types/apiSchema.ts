import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { User } from '@domain/entities/User';
import { ApiErrorCode, ApiSuccessCode } from '@domain/types/apiCodes';

export class ApiError extends Error {
  data: unknown;
  status: number;
  code: ApiErrorCode | ApiSuccessCode;
  success: boolean;

  constructor({ message, data, status, code, success = false }: ApiResponse<unknown>) {
    super(message && message.trim() ? message : ApiErrorCodes.UNKNOWN_ERROR);
    this.data = data;
    this.status = status;
    this.code = code;
    this.success = success;
  }
}

export type ApiPromise<T = unknown> = Promise<ApiResponse<T>>;

/**
 * Estructura base consistente para todas las respuestas de la API
 */
export interface ApiResponse<T> {
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Los datos de respuesta (null si no hay datos o en caso de error) */
  data: T | null;
  /** Código de estado HTTP */
  status: number;
  /** Código semántico de la aplicación para manejo granular de casos */
  code: ApiErrorCode | ApiSuccessCode;
  /** Mensaje descriptivo (siempre presente) */
  message: string;
  /** Timestamp de la respuesta (ISO 8601) */
  timestamp?: string;
  /** ID único de la request para trazabilidad */
  requestId?: string;
  /** Metadatos adicionales (paginación, validaciones, etc.) */
  meta?: Record<string, unknown>;
}

/**
 * Respuesta exitosa tipada
 */
export interface ApiSuccessResponse<T> extends ApiResponse<T> {
  success: true;
  data: T | null;
  code: ApiSuccessCode;
  message: string;
}

/**
 * Respuesta de error tipada
 */
export interface ApiErrorResponse<T> extends ApiResponse<T> {
  success: false;
  data: T | null;
  code: ApiErrorCode;
  message: string;
  /** Detalles específicos del error */
  error?: {
    /** Tipo de error (validation, network, server, etc.) */
    type?: 'validation' | 'network' | 'server' | 'authentication' | 'authorization' | 'business';
    /** Errores de validación específicos por campo */
    details?: Array<{
      field: string;
      code: string;
      message: string;
    }>;
    /** Stack trace (solo en desarrollo) */
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
