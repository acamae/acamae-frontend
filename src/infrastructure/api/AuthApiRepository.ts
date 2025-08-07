import type { AxiosResponse, AxiosError } from 'axios';

import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { USER_ROLES } from '@domain/constants/user';
import { User } from '@domain/entities/User';
import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { UserResponse } from '@domain/types/api';
import {
  ApiErrorResponse,
  ApiPromise,
  ApiSuccessResponse,
  EmailVerificationResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResendVerificationPayload,
  ResetPasswordPayload,
  ResetTokenValidationResponse,
  ValidateResetTokenPayload,
  VerifyEmailPayload,
} from '@domain/types/apiSchema';
import { tokenService } from '@infrastructure/storage/tokenService';
import {
  API_ROUTES,
  getAuthResetPasswordUrl,
  getAuthVerifyEmailUrl,
  getDeleteUserByIdUrl,
  getUpdateUserByIdUrl,
  getUserByIdUrl,
} from '@shared/constants/apiRoutes';
import api from '@shared/services/axiosService';
import { generateSecureId } from '@shared/utils/generateSecureId';

function mapUserResponse(data: UserResponse): User {
  return {
    id: data.id,
    email: data.email,
    username: data.username,
    role: data.role === USER_ROLES.ADMIN ? USER_ROLES.ADMIN : USER_ROLES.USER,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * @param response: AxiosResponse<T, D>
 * {
 *   data: T;
 *   status: number;
 *   statusText: string;
 *   headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
 *   config: InternalAxiosRequestConfig<D>;
 *   request?: any;
 * }
 *
 * ApiResponse<T> {
 *   success: boolean;
 *   data: T | null;
 *   code: ApiSuccessCode;
 *   message: string;
 *   timestamp: string;
 *   requestId: string;
 *   meta?: Record<string, unknown>;
 * }
 *
 * response.data: ApiSuccessResponse<T> extends ApiResponse<T> {
 *   success: true;
 *   data: T | null;
 *   code: "SUCCESS";
 *   message: string;
 *   timestamp: string;
 *   requestId: string;
 * }
 * @returns ApiSuccessResponse<T>
 */
function handleApiSuccess<T>({ response }: { response: AxiosResponse<T> }): ApiSuccessResponse<T> {
  const data = response.data as ApiSuccessResponse<T>;
  const requestId =
    response.headers?.['x-request-id'] ??
    data.requestId ??
    `req_${Date.now()}_${generateSecureId()}`;
  const message = data.message ?? response.statusText ?? 'Operation successful';

  const meta = data.meta ?? response.headers;

  return {
    success: data.success,
    data: data.data ?? null,
    status: response.status,
    code: data.code,
    message,
    timestamp: data.timestamp ?? new Date().toISOString(),
    requestId,
    meta,
  };
}

/**
 * @param error: AxiosError
 * {
 *    message?: string,
 *    name?: "AxiosError",
 *    code?: string,
 *    config?: InternalAxiosRequestConfig<D>,
 *    request?: any,
 *    response?: AxiosResponse<T, D> {
 *      data: ApiErrorResponse<T>;
 *      status: number;
 *      statusText: string;
 *      headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
 *      config: InternalAxiosRequestConfig<D>;
 *      request?: any;
 *    }
 * }
 *
 * ApiResponse<T> {
 *   success: boolean;
 *   data: T | null;
 *   code: ApiSuccessCode;
 *   message: string;
 *   timestamp: string;
 *   requestId: string;
 *   meta?: Record<string, unknown>;
 * }
 *
 * ApiErrorResponse<T> {
 *   success: false;
 *   data: T | null;
 *   code: ApiErrorCode;
 *   message: string;
 *   timestamp: string;
 *   requestId: string;
 *   meta?: Record<string, unknown>;
 *   error?: {
 *     type?: 'validation' | 'network' | 'server' | 'authentication' | 'authorization' | 'business';
 *     details?: Array<{
 *       field: string;
 *       code: string;
 *       message: string;
 *     }>;
 *     stack?: string;
 *   };
 * }
 * @returns ApiErrorResponse<T>
 */
function handleApiError<T>(error: AxiosError): ApiErrorResponse<T> {
  if (error) {
    // Si hay respuesta del servidor, usar esos datos
    if (error.response?.data && typeof error.response.data === 'object') {
      const serverData = error.response.data as ApiErrorResponse<T>;
      return {
        success: false,
        data: serverData.data ?? null,
        status: error.response.status,
        code: serverData.code ?? ApiErrorCodes.UNKNOWN_ERROR,
        message: serverData.message ?? error.message ?? 'Server error',
        timestamp: serverData.timestamp ?? new Date().toISOString(),
        requestId:
          serverData.requestId ??
          error.config?.headers?.['x-request-id'] ??
          `req_${Date.now()}_${generateSecureId()}`,
        meta: serverData.meta,
        error: serverData.error,
      } as ApiErrorResponse<T>;
    }

    // Si no hay respuesta del servidor, manejar errores de red/cliente
    const networkErrorCode = (error.code as string) ?? ApiErrorCodes.ERR_NETWORK;
    const errorType = getErrorType(error);

    return {
      success: false,
      data: null,
      status: 0, // Network errors always have status 0
      code: networkErrorCode,
      message: getErrorMessage(error),
      timestamp: new Date().toISOString(),
      requestId:
        error.config?.headers?.['x-request-id'] ?? `req_${Date.now()}_${generateSecureId()}`,
      error: {
        type: errorType,
        details: [
          {
            field: 'network',
            code: networkErrorCode,
            message: error.message,
          },
        ],
      },
    } as ApiErrorResponse<T>;
  }

  // Error no identificado
  return {
    success: false,
    data: null,
    status: 500, // Unknown errors default to 500
    code: ApiErrorCodes.UNKNOWN_ERROR,
    message: 'Unknown error occurred',
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}_${generateSecureId()}`,
    error: {
      type: 'server',
      details: [
        {
          field: 'unknown',
          code: ApiErrorCodes.UNKNOWN_ERROR,
          message: error as unknown as string,
        },
      ],
    },
  } as ApiErrorResponse<T>;
}

/**
 * Determina el tipo de error basado en el AxiosError
 */
function getErrorType(
  error: AxiosError
): 'validation' | 'network' | 'server' | 'authentication' | 'authorization' | 'business' {
  if (!error.response) {
    return 'network';
  }

  const status = error.response.status;
  if (status === 401) return 'authentication';
  if (status === 403) return 'authorization';
  if (status === 422) return 'validation';
  if (status >= 400 && status < 500) return 'business';
  return 'server';
}

/**
 * Genera un mensaje de error amigable basado en el AxiosError
 */
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data && typeof error.response.data === 'object') {
    const responseData = error.response.data as Record<string, unknown>;
    if (responseData.message && typeof responseData.message === 'string') {
      return responseData.message;
    }
  }

  const code = error.code;
  switch (code) {
    case 'ECONNABORTED':
      return 'La conexión se ha cancelado';
    case 'ETIMEDOUT':
      return 'La solicitud ha excedido el tiempo límite';
    case 'ERR_NETWORK':
      return 'Error de red. Verifica tu conexión';
    case 'ERR_CANCELED':
      return 'La solicitud fue cancelada';
    default:
      return error.message ?? 'Error de conexión';
  }
}

export class AuthApiRepository implements IAuthRepository {
  async login(payload: LoginPayload): ApiPromise<User> {
    try {
      const response = await api.post(API_ROUTES.AUTH.LOGIN, {
        ...payload,
      });

      // Extraer tokens y usuario
      const { accessToken, refreshToken, user } = response.data?.data ?? {};
      if (accessToken && refreshToken) {
        tokenService.setAccessToken(accessToken);
        tokenService.setRefreshToken(refreshToken);
      }

      return handleApiSuccess({
        response: {
          ...response,
          data: {
            ...response.data,
            data: user ? mapUserResponse(user) : null,
          },
        },
      });
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }

  async register(payload: RegisterPayload): ApiPromise<void> {
    try {
      const response = await api.post(API_ROUTES.AUTH.REGISTER, payload);
      return handleApiSuccess({
        response: {
          ...response,
          data: {
            ...response.data,
            user: null,
          },
        },
      });
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }

  async forgotPassword(payload: ForgotPasswordPayload): ApiPromise<void> {
    try {
      const response = await api.post(API_ROUTES.AUTH.FORGOT_PASSWORD, payload);
      return handleApiSuccess({ response });
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }

  async resetPassword(payload: ResetPasswordPayload): ApiPromise<void> {
    try {
      const response = await api.put(getAuthResetPasswordUrl(payload.token), {
        password: payload.password,
      });
      return handleApiSuccess({ response });
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }

  async validateResetToken(
    payload: ValidateResetTokenPayload
  ): ApiPromise<ResetTokenValidationResponse> {
    try {
      const response = await api.post(getAuthResetPasswordUrl(payload.token), {
        token: payload.token,
      });
      return handleApiSuccess({ response });
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }

  async logout(): ApiPromise<void> {
    try {
      const response = await api.post(API_ROUTES.AUTH.LOGOUT, {
        refreshToken: tokenService.getRefreshToken(),
      });

      // limpiar tokens locales
      tokenService.clear();
      return handleApiSuccess({ response });
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }

  async getCurrentUser(): ApiPromise<User> {
    try {
      const response = await api.get(API_ROUTES.AUTH.ME);
      return handleApiSuccess({
        response: {
          ...response,
          data: {
            ...response.data,
            user: mapUserResponse(response.data),
          },
        },
      });
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }

  async findAll(): ApiPromise<User[]> {
    try {
      const response = await api.get(API_ROUTES.USERS.GET_ALL);
      return handleApiSuccess({
        response: {
          ...response,
          data: {
            ...response.data,
            data: response.data.data.map(mapUserResponse),
          },
        },
      });
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }

  async findById(id: string): ApiPromise<User | null> {
    try {
      const response = await api.get(getUserByIdUrl(id));
      return handleApiSuccess({
        response: {
          ...response,
          data: {
            ...response.data,
            user: mapUserResponse(response.data),
          },
        },
      });
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }

  async save(entity: User): ApiPromise<User> {
    try {
      const response = await api.put(getUpdateUserByIdUrl(entity.id), {
        email: entity.email,
        username: entity.username,
        role: entity.role,
      });
      return handleApiSuccess({
        response: {
          ...response,
          data: {
            ...response.data,
            user: mapUserResponse(response.data),
          },
        },
      });
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }

  async delete(id: string): ApiPromise<void> {
    try {
      const response = await api.delete(getDeleteUserByIdUrl(id));
      return handleApiSuccess({ response });
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }

  async resendVerification(payload: ResendVerificationPayload): ApiPromise<void> {
    try {
      const response = await api.post(API_ROUTES.AUTH.VERIFY_EMAIL_RESEND, payload);
      return handleApiSuccess({ response });
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }

  async verifyEmail(payload: VerifyEmailPayload): ApiPromise<EmailVerificationResponse> {
    try {
      const response = await api.post(getAuthVerifyEmailUrl(payload.token));
      return handleApiSuccess({ response });
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }
}
