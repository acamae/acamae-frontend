import { AxiosError, AxiosResponse } from 'axios';

import {
  ApiPromise,
  ApiResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from '@/domain/types/apiSchema';
import { USER_ROLES } from '@domain/constants/user';
import { User } from '@domain/entities/User';
import { AuthRepository } from '@domain/repositories/AuthRepository';
import { UserResponse } from '@domain/types/api';
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

/**
 * Map the response from the AxiosResponse type to the ApiResponseSuccess type
 * @param response AxiosResponse
 * @description 2xx response with data
 * @returns ApiResponseSuccess
 */
function mapApiAxiosResponseError<T>({
  response,
}: {
  response: AxiosResponse<T>; // data, status, statusText, headers, config, request?
}): ApiResponse<T> {
  return {
    data: response.data,
    status: response.status,
    success: false,
  };
}

/**
 * Map the error from the AxiosError type to the ApiError type
 * @param error AxiosError
 * @description 4xx or 5xx response with error
 * @returns ApiError
 */
function mapApiAxiosRequestError<T>({
  error,
}: {
  error: AxiosError<T>; // response, request, status, cause, code, message, name, stack, toJSON
}): ApiResponse<T> {
  return {
    success: false,
    status: error.status ?? 500,
    message: error.message ?? 'A request error occurred',
    code: error.code ?? 'REQUEST_ERROR',
  };
}

/**
 * Map the unknown error from the AxiosError type to the ApiError type
 * @param error AxiosError
 * @description unknown error
 * @returns ApiError
 */
function mapApiAxiosUnknownError<T>(): ApiResponse<T> {
  return {
    success: false,
    status: 500,
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Map the response from the AxiosResponse type to the ApiResponseSuccess type
 * @param response AxiosResponse
 * @description 2xx response with data
 * @returns ApiResponseSuccess
 */
function handleApiSuccess<T>({
  response,
}: {
  response: AxiosResponse<T>; // data, status, statusText, headers, config, request?
}): ApiResponse<T> {
  return {
    data: response.data,
    status: response.status,
    success: response.status >= 200 && response.status < 300,
  };
}

/**
 * Map the error from the AxiosError type to the ApiError type
 * @param error AxiosError
 * @description 4xx or 5xx response with error
 * @returns ApiError
 */
function handleApiError<T>(error: unknown): ApiResponse<T> {
  if (error instanceof AxiosError && error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return mapApiAxiosResponseError({ response: error.response });
  } else if (error instanceof AxiosError && error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    return mapApiAxiosRequestError({ error });
  }

  // Something happened in setting up the request that triggered an Error
  return mapApiAxiosUnknownError();
}

export class AuthApiRepository implements AuthRepository {
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
        newPassword: payload.newPassword,
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
}
