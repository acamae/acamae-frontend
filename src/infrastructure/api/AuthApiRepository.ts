import { AxiosError, AxiosResponse } from 'axios';

import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { ApiSuccessCodes } from '@domain/constants/successCodes';
import { USER_ROLES } from '@domain/constants/user';
import { User } from '@domain/entities/User';
import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { UserResponse } from '@domain/types/api';
import {
  ApiPromise,
  ApiErrorResponse,
  ApiSuccessResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  ResendVerificationPayload,
  VerifyEmailPayload,
  EmailVerificationResponse,
} from '@domain/types/apiSchema';
import { tokenService } from '@infrastructure/storage/tokenService';
import {
  API_ROUTES,
  getUserByIdUrl,
  getUpdateUserByIdUrl,
  getDeleteUserByIdUrl,
  getAuthResetPasswordUrl,
  getAuthVerifyEmailUrl,
} from '@shared/constants/apiRoutes';
import api from '@shared/services/axiosService';

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
  return {
    data: response.data ?? null,
    status: response.status,
    success: true,
    code: ApiSuccessCodes.SUCCESS,
  };
}

function handleApiError<T>(error: unknown): ApiErrorResponse<T> {
  if (error instanceof AxiosError) {
    return {
      ...error.response?.data,
    } as ApiErrorResponse<T>;
  }
  return {
    message: 'Unknown error',
    code: ApiErrorCodes.UNKNOWN_ERROR,
    success: false,
    data: null,
    status: 500,
  } as ApiErrorResponse<T>;
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
