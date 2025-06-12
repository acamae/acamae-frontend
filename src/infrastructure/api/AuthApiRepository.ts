import { AxiosError, AxiosResponse } from 'axios';

import { ApiErrorCode } from '@domain/constants/apiCodes';
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
} from '@domain/types/apiSchema';
import {
  API_ROUTES,
  getUserByIdUrl,
  getUpdateUserByIdUrl,
  getDeleteUserByIdUrl,
  getAuthResetPasswordUrl,
} from '@shared/constants/apiRoutes';
import api from '@shared/services/axiosService';

function mapUserResponse(data: UserResponse): User {
  return {
    id: data.id,
    email: data.email,
    username: data.username,
    role: data.role === USER_ROLES.ADMIN ? USER_ROLES.ADMIN : USER_ROLES.USER,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}

function mapApiAxiosResponseError<T>({
  error,
}: {
  error: AxiosError<T>; // message, code, config, request, response
}): ApiErrorResponse<T> {
  return {
    success: false,
    data: null,
    status: error.response?.status ?? 500,
    message: error.message,
    code: (error.code as ApiErrorCode) ?? ApiErrorCodes.ERR_BAD_RESPONSE,
  };
}

export function mapApiAxiosRequestError<T>({
  error,
}: {
  error: Partial<AxiosError<T>>;
}): ApiErrorResponse<T> {
  return {
    success: false,
    data: null,
    status: error.status ?? 500,
    message: error.message ?? 'A request error occurred',
    code: (error.code as ApiErrorCode) ?? ApiErrorCodes.ERR_BAD_REQUEST,
  };
}

function mapApiAxiosUnknownError<T>(): ApiErrorResponse<T> {
  return {
    success: false,
    data: null,
    status: 500,
    message: ApiErrorCodes.UNKNOWN_ERROR,
    code: ApiErrorCodes.UNKNOWN_ERROR,
  } as ApiErrorResponse<T>;
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
  if (error instanceof AxiosError && error.response) {
    return mapApiAxiosResponseError({ error });
  } else if (error instanceof AxiosError && error.request) {
    return mapApiAxiosRequestError({ error });
  }
  return mapApiAxiosUnknownError();
}

export class AuthApiRepository implements IAuthRepository {
  async login(payload: LoginPayload): ApiPromise<User> {
    try {
      const response = await api.post(API_ROUTES.AUTH.LOGIN, {
        ...payload,
      });
      return handleApiSuccess({
        response: {
          ...response,
          data: { ...mapUserResponse(response.data) },
        },
      });
    } catch (error: unknown) {
      return handleApiError(error);
    }
  }

  async register(payload: RegisterPayload): ApiPromise<User> {
    try {
      const response = await api.post(API_ROUTES.AUTH.REGISTER, payload);
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
      const response = await api.post(API_ROUTES.AUTH.LOGOUT);
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
}
