import { AxiosError, AxiosResponse } from 'axios';

import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { ApiSuccessCodes } from '@domain/constants/successCodes';
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

function handleApiSuccess<T>({
  response,
}: {
  response: AxiosResponse<T>; // data, status, statusText, headers, config, request?
}): ApiSuccessResponse<T> {
  const requestId = response.headers?.['x-request-id'] || `req_${Date.now()}_${generateSecureId()}`;

  return {
    data: response.data ?? null,
    status: response.status,
    success: true as const,
    code: ApiSuccessCodes.SUCCESS,
    message: response.statusText || 'Operation successful',
    timestamp: new Date().toISOString(),
    requestId,
  };
}

function handleApiError<T>(error: unknown): ApiErrorResponse<T> {
  if (error instanceof AxiosError) {
    // Si hay respuesta del servidor, usar esos datos
    if (error.response?.data && typeof error.response.data === 'object') {
      const serverData = error.response.data as Record<string, unknown>;
      return {
        success: false,
        data: serverData.data || null,
        status: error.response.status,
        code: serverData.code || ApiErrorCodes.UNKNOWN_ERROR,
        message: serverData.message || error.message || 'Server error',
        timestamp: serverData.timestamp || new Date().toISOString(),
        requestId: serverData.requestId,
        meta: serverData.meta,
        error: serverData.error,
      } as ApiErrorResponse<T>;
    }

    // Si no hay respuesta del servidor, manejar errores de red/cliente
    const networkErrorCode = (error.code as string) || ApiErrorCodes.ERR_NETWORK;
    const errorType = getErrorType(error);

    return {
      message: getErrorMessage(error),
      code: networkErrorCode,
      success: false,
      data: null,
      status: error.response?.status || 0,
      timestamp: new Date().toISOString(),
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
    message: 'Unknown error occurred',
    code: ApiErrorCodes.UNKNOWN_ERROR,
    success: false,
    data: null,
    status: 500,
    timestamp: new Date().toISOString(),
    error: {
      type: 'server',
      details: [
        {
          field: 'unknown',
          code: ApiErrorCodes.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : String(error),
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
      return error.message || 'Error de conexión';
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
          data: user ? { ...mapUserResponse(user) } : null,
        },
      });
    } catch (error: unknown) {
      return handleApiError(error);
    }
  }

  async register(payload: RegisterPayload): ApiPromise<void> {
    try {
      const response = await api.post(API_ROUTES.AUTH.REGISTER, payload);
      return handleApiSuccess({
        response: {
          ...response,
          data: null,
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  }

  async forgotPassword(payload: ForgotPasswordPayload): ApiPromise<void> {
    try {
      const response = await api.post(API_ROUTES.AUTH.FORGOT_PASSWORD, payload);
      return handleApiSuccess({ response });
    } catch (error) {
      return handleApiError(error);
    }
  }

  async resetPassword(payload: ResetPasswordPayload): ApiPromise<void> {
    try {
      const response = await api.post(getAuthResetPasswordUrl(payload.token), {
        password: payload.password,
      });
      return handleApiSuccess({ response });
    } catch (error) {
      return handleApiError(error);
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
      return handleApiError(error);
    }
  }

  async getCurrentUser(): ApiPromise<User> {
    try {
      const response = await api.get(API_ROUTES.AUTH.ME);
      return handleApiSuccess({
        response: {
          ...response,
          data: { ...mapUserResponse(response.data) },
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  }

  async findAll(): ApiPromise<User[]> {
    try {
      const response = await api.get(API_ROUTES.USERS.GET_ALL);
      return handleApiSuccess({
        response: {
          ...response,
          data: response.data.map(mapUserResponse),
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  }

  async findById(id: string): ApiPromise<User | null> {
    try {
      const response = await api.get(getUserByIdUrl(id));
      return handleApiSuccess({
        response: {
          ...response,
          data: { ...mapUserResponse(response.data) },
        },
      });
    } catch (error) {
      return handleApiError(error);
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
          data: { ...mapUserResponse(response.data) },
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  }

  async delete(id: string): ApiPromise<void> {
    try {
      const response = await api.delete(getDeleteUserByIdUrl(id));
      return handleApiSuccess({ response });
    } catch (error) {
      return handleApiError(error);
    }
  }

  async resendVerification(payload: ResendVerificationPayload): ApiPromise<void> {
    try {
      const response = await api.post(API_ROUTES.AUTH.VERIFY_EMAIL_RESEND, payload);
      return handleApiSuccess({ response });
    } catch (error) {
      return handleApiError(error);
    }
  }

  async verifyEmail(payload: VerifyEmailPayload): ApiPromise<EmailVerificationResponse> {
    try {
      const response = await api.post(getAuthVerifyEmailUrl(payload.token));
      return handleApiSuccess({ response });
    } catch (error) {
      return handleApiError(error);
    }
  }
}
