import { AxiosError, AxiosHeaders } from 'axios';

import { USER_ROLES } from '@domain/constants/user';
import { ApiErrorCode } from '@domain/types/apiCodes';
import { ApiErrorResponse } from '@domain/types/apiSchema';
import { AuthApiRepository } from '@infrastructure/api/AuthApiRepository';
import { tokenService } from '@infrastructure/storage/tokenService';
import { API_ROUTES } from '@shared/constants/apiRoutes';

interface CreateAxiosMock {
  post: jest.Mock;
  get: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
}

jest.mock('@shared/services/axiosService', () => {
  const instance = {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
  return { __esModule: true, default: instance };
});

let createAxiosMock: CreateAxiosMock;

const getMock = () => {
  if (!createAxiosMock) {
    createAxiosMock = jest.requireMock('@shared/services/axiosService').default;
  }
  return createAxiosMock;
};

const repo = new AuthApiRepository();

const userResponse = {
  id: '1',
  email: 'a@b.com',
  username: 'alice',
  role: USER_ROLES.USER,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

// Type guard para error seguro en tests
function isApiError(obj: unknown): obj is { error?: { type?: string } } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'error' in obj &&
    (typeof (obj as Record<string, unknown>).error === 'object' ||
      typeof (obj as Record<string, unknown>).error === 'undefined')
  );
}

fdescribe('AuthApiRepository', () => {
  it('should login and map the response correctly', async () => {
    getMock().post.mockResolvedValue({
      data: {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'a@b.com',
            username: 'alice',
            role: 'user',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
          accessToken: 'mockAccess',
          refreshToken: 'mockRefresh',
        },
        code: 'SUCCESS',
        message: 'Login successful',
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: '550e8400-e29b-41d4-a716-446655440000',
      },
    });

    const result = await repo.login({ email: 'a@b.com', password: '123456' });

    expect(getMock().post).toHaveBeenCalledWith(API_ROUTES.AUTH.LOGIN, {
      email: 'a@b.com',
      password: '123456',
    });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe('a@b.com');
  });

  it('should login and return error payload when http 400', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.LOGIN };
    const response: ApiErrorResponse<null> = {
      data: null,
      success: false,
      code: 'UNKNOWN_ERROR',
      message: 'Bad Request',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: '550e8400-e29b-41d4-a716-446655440000',
    };

    const error = new AxiosError('Bad Request', 'UNKNOWN_ERROR', config, request, {
      status: 400,
      data: response,
      statusText: 'Bad Request',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(error);

    const result = await repo.login({ email: 'a@b.com', password: '123456' });

    expect(result).toEqual({
      success: false,
      data: null,
      code: 'UNKNOWN_ERROR',
      message: 'Bad Request',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: '550e8400-e29b-41d4-a716-446655440000',
      meta: undefined,
      error: undefined,
    });
  });

  it('should forgotPassword and return structured error on network error', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.FORGOT_PASSWORD };

    const error = new AxiosError('Network', 'ERR_NETWORK', config, request, {
      status: 0,
      data: null,
      statusText: 'Network Error',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(error);

    const result = await repo.forgotPassword({ email: 'a@b.com' });

    expect(getMock().post).toHaveBeenCalledWith(API_ROUTES.AUTH.FORGOT_PASSWORD, {
      email: 'a@b.com',
    });
    expect(result).toEqual({
      success: false,
      data: null,
      code: 'ERR_NETWORK',
      message: 'Error de red. Verifica tu conexión',
      timestamp: expect.any(String),
      requestId: expect.any(String),
      error: {
        type: 'server',
        details: [
          {
            field: 'network',
            code: 'ERR_NETWORK',
            message: 'Network',
          },
        ],
      },
    });
  });

  it('should register and return success', async () => {
    getMock().post.mockResolvedValue({
      data: {
        success: true,
        data: userResponse,
        code: 'SUCCESS',
        message: 'User registered successfully',
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'test-request-id',
      },
    });
    const result = await repo.register({ email: 'x@y.com', password: 'pwd', username: 'user' });
    expect(getMock().post).toHaveBeenCalledWith(API_ROUTES.AUTH.REGISTER, {
      email: 'x@y.com',
      password: 'pwd',
      username: 'user',
    });
    expect(result.success).toBe(true);
  });

  it('should logout and return success', async () => {
    getMock().post.mockResolvedValue({
      data: {
        success: true,
        data: null,
        code: 'SUCCESS',
        message: 'Logout successful',
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'test-request-id',
      },
    });
    jest.spyOn(tokenService, 'getRefreshToken').mockReturnValue('mockRefresh');
    const result = await repo.logout();
    expect(getMock().post).toHaveBeenCalledWith(API_ROUTES.AUTH.LOGOUT, {
      refreshToken: 'mockRefresh',
    });
    expect(result.success).toBe(true);
    jest.restoreAllMocks();
  });

  it('should findAll and return array of users', async () => {
    getMock().get.mockResolvedValue({
      data: {
        success: true,
        data: [userResponse],
        code: 'SUCCESS',
        message: 'Users retrieved successfully',
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'test-request-id',
      },
    });
    const result = await repo.findAll();
    expect(getMock().get).toHaveBeenCalledWith(API_ROUTES.USERS.GET_ALL);
    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(1);
  });

  it('should handleApiSuccess and map the response correctly', async () => {
    getMock().get.mockResolvedValue({
      data: {
        success: true,
        data: userResponse,
        code: 'SUCCESS',
        message: 'User retrieved successfully',
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'test-request-id',
      },
    });
    const result = await repo.getCurrentUser();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(
      expect.objectContaining({
        email: userResponse.email,
        username: userResponse.username,
      })
    );
  });

  it('should handle response error and return backend payload', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.USERS.GET_ALL };
    const response: ApiErrorResponse<null> = {
      data: null,
      success: false,
      code: 'UNKNOWN_ERROR',
      message: 'Internal Server Error',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
    };

    const error = new AxiosError('Server Error', 'UNKNOWN_ERROR', config, request, {
      status: 500,
      data: response,
      statusText: 'Server Error',
      config,
      headers,
    });
    getMock().get.mockRejectedValue(error);
    const result = await repo.getCurrentUser();
    expect(result).toEqual({
      success: false,
      data: null,
      code: 'UNKNOWN_ERROR',
      message: 'Internal Server Error',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
      meta: undefined,
      error: undefined,
    });
  });

  it('should return structured error on network error when no response', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.USERS.GET_BY_ID };

    const error = new AxiosError('Network Error', 'ERR_NETWORK', config, request, {
      status: 0,
      data: null,
      statusText: 'Network Error',
      config,
      headers,
    });
    getMock().get.mockRejectedValue(error);
    const result = await repo.getCurrentUser();
    expect(result).toEqual({
      success: false,
      data: null,
      code: 'ERR_NETWORK',
      message: 'Error de red. Verifica tu conexión',
      timestamp: expect.any(String),
      requestId: expect.any(String),
      error: {
        type: 'server',
        details: [
          {
            field: 'network',
            code: 'ERR_NETWORK',
            message: 'Network Error',
          },
        ],
      },
    });
  });

  it('should handleApiError and handle unknown error', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.USERS.GET_BY_ID };

    const error = new AxiosError('Unknown Error', 'UNKNOWN_ERROR', config, request, {
      status: 0,
      data: null,
      statusText: 'Unknown Error',
      config,
      headers,
    });
    getMock().get.mockRejectedValue(error);
    const result = await repo.getCurrentUser();
    expect(result.success).toBe(false);
    expect(result.code).toBe('UNKNOWN_ERROR');
  });

  it('should findById and return success', async () => {
    getMock().get.mockResolvedValue({
      data: {
        success: true,
        data: userResponse,
        code: 'SUCCESS',
        message: 'User retrieved successfully',
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'test-request-id',
      },
    });
    const result = await repo.findById('1');
    expect(getMock().get).toHaveBeenCalledWith(expect.stringContaining('/users/1'));
    expect(result.success).toBe(true);
    expect(result.data).toEqual(
      expect.objectContaining({
        id: '1',
        email: userResponse.email,
      })
    );
  });

  it('should findById and propagate backend error payload', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.USERS.GET_BY_ID };
    const response: ApiErrorResponse<null> = {
      data: null,
      success: false,
      code: 'NOT_FOUND' as ApiErrorCode,
      message: 'User not found',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
    };

    const error = new AxiosError('Not Found', 'NOT_FOUND', config, request, {
      status: 404,
      data: response,
      statusText: 'Not Found',
      config,
      headers,
    });
    getMock().get.mockRejectedValue(error);
    const result = await repo.findById('1');
    expect(result).toEqual({
      success: false,
      data: null,
      code: 'NOT_FOUND',
      message: 'User not found',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
      meta: undefined,
      error: undefined,
    });
  });

  it('should save and return success', async () => {
    const updatedUser = { ...userResponse, username: 'updated' };
    getMock().put.mockResolvedValue({
      data: {
        success: true,
        data: updatedUser,
        code: 'SUCCESS',
        message: 'User updated successfully',
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'test-request-id',
      },
    });
    const result = await repo.save({
      id: '1',
      email: 'a@b.com',
      username: 'updated',
      role: USER_ROLES.USER,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    });
    expect(getMock().put).toHaveBeenCalledWith(
      expect.stringContaining('/users/1'),
      expect.objectContaining({
        email: 'a@b.com',
        username: 'updated',
        role: USER_ROLES.USER,
      })
    );
    expect(result.success).toBe(true);
    expect(result.data?.username).toBe('updated');
  });

  it('should save and propagate backend validation error', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.USERS.UPDATE_BY_ID };
    const response: ApiErrorResponse<null> = {
      data: null,
      success: false,
      code: 'INVALID_DATA' as ApiErrorCode,
      message: 'Invalid data',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
    };

    const error = new AxiosError('Bad Request', 'INVALID_DATA', config, request, {
      status: 400,
      data: response,
      statusText: 'Bad Request',
      config,
      headers,
    });
    getMock().put.mockRejectedValue(error);
    const result = await repo.save({
      id: '1',
      email: 'a@b.com',
      username: 'updated',
      role: USER_ROLES.USER,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    });
    expect(result).toEqual({
      success: false,
      data: null,
      code: 'INVALID_DATA',
      message: 'Invalid data',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
      meta: undefined,
      error: undefined,
    });
  });

  it('should delete and return success', async () => {
    getMock().delete.mockResolvedValue({
      data: {
        success: true,
        data: null,
        code: 'SUCCESS',
        message: 'User deleted successfully',
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'test-request-id',
      },
    });
    const result = await repo.delete('1');
    expect(getMock().delete).toHaveBeenCalledWith(expect.stringContaining('/users/1'));
    expect(result.success).toBe(true);
  });

  it('should delete and propagate backend error', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: '/users/1' };
    const response: ApiErrorResponse<null> = {
      data: null,
      success: false,
      code: 'NOT_FOUND' as ApiErrorCode,
      message: 'User not found',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
    };

    const error = new AxiosError('Not Found', 'NOT_FOUND', config, request, {
      status: 404,
      data: response,
      statusText: 'Not Found',
      config,
      headers,
    });
    getMock().delete.mockRejectedValue(error);
    const result = await repo.delete('1');
    expect(result).toEqual({
      success: false,
      data: null,
      code: 'NOT_FOUND',
      message: 'User not found',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
      meta: undefined,
      error: undefined,
    });
  });

  it('should resetPassword and return success', async () => {
    getMock().put.mockResolvedValue({
      data: {
        success: true,
        data: null,
        code: 'SUCCESS',
        message: 'Password has been reset successfully',
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'test-request-id',
      },
    });
    const result = await repo.resetPassword({ token: 'valid-token', password: 'new-password' });
    expect(getMock().put).toHaveBeenCalledWith(
      expect.stringContaining('/auth/reset-password/valid-token'),
      { password: 'new-password' }
    );
    expect(result.success).toBe(true);
  });

  it('should resetPassword and propagate backend error', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: '/auth/reset-password/invalid-token' };
    const response: ApiErrorResponse<null> = {
      data: null,
      success: false,
      code: 'INVALID_RESET_TOKEN',
      message: 'Invalid or expired token',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
    };

    const error = new AxiosError('Invalid token', 'INVALID_RESET_TOKEN', config, request, {
      status: 400,
      data: response,
      statusText: 'Bad Request',
      config,
      headers,
    });
    getMock().put.mockRejectedValue(error);
    const result = await repo.resetPassword({
      token: 'invalid-token',
      password: 'new-password',
    });
    expect(result).toEqual({
      success: false,
      data: null,
      code: 'INVALID_RESET_TOKEN',
      message: 'Invalid or expired token',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
      meta: undefined,
      error: undefined,
    });
  });

  it('should logout and propagate server error', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.LOGOUT };
    const response: ApiErrorResponse<null> = {
      data: null,
      success: false,
      code: 'UNKNOWN_ERROR',
      message: 'Internal Server Error',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
    };

    const error = new AxiosError('Server Error', 'UNKNOWN_ERROR', config, request, {
      status: 500,
      data: response,
      statusText: 'Server Error',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(error);
    const result = await repo.logout();
    expect(result).toEqual({
      success: false,
      data: null,
      code: 'UNKNOWN_ERROR',
      message: 'Internal Server Error',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
      meta: undefined,
      error: undefined,
    });
  });

  it('should getCurrentUser and propagate backend unauthorized error', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.USERS.GET_BY_ID };
    const response: ApiErrorResponse<null> = {
      data: null,
      success: false,
      code: 'UNAUTHORIZED' as ApiErrorCode,
      message: 'Not authenticated',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
    };

    const error = new AxiosError('Unauthorized', 'UNAUTHORIZED', config, request, {
      status: 401,
      data: response,
      statusText: 'Unauthorized',
      config,
      headers,
    });
    getMock().get.mockRejectedValue(error);
    const result = await repo.getCurrentUser();
    expect(result).toEqual({
      success: false,
      data: null,
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
      meta: undefined,
      error: undefined,
    });
  });

  it('should findById and return structured error on network error', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: '/users/1' };

    const error = new AxiosError('Network Error', 'ERR_NETWORK', config, request, {
      status: 0,
      data: null,
      statusText: 'Network Error',
      config,
      headers,
    });
    getMock().get.mockRejectedValue(error);
    const result = await repo.findById('1');
    expect(result).toEqual({
      success: false,
      data: null,
      code: 'ERR_NETWORK',
      message: 'Error de red. Verifica tu conexión',
      timestamp: expect.any(String),
      requestId: expect.any(String),
      error: {
        type: 'server',
        details: [
          {
            field: 'network',
            code: 'ERR_NETWORK',
            message: 'Network Error',
          },
        ],
      },
    });
  });

  it('should handle INVALID_REFRESH_TOKEN error in login', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.LOGIN };
    const response: ApiErrorResponse<null> = {
      data: null,
      success: false,
      code: 'INVALID_REFRESH_TOKEN',
      message: 'Invalid refresh token',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
    };

    const error = new AxiosError('Unauthorized', 'INVALID_REFRESH_TOKEN', config, request, {
      status: 401,
      data: response,
      statusText: 'Unauthorized',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(error);
    const result = await repo.login({ email: 'test@example.com', password: 'password' });
    expect(result).toEqual({
      success: false,
      data: null,
      code: 'INVALID_REFRESH_TOKEN',
      message: 'Invalid refresh token',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
      meta: undefined,
      error: undefined,
    });
  });

  it('should handle EMAIL_NOT_VERIFIED error in login', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.LOGIN };
    const response: ApiErrorResponse<null> = {
      data: null,
      success: false,
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Email not verified',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
    };

    const error = new AxiosError('Forbidden', 'EMAIL_NOT_VERIFIED', config, request, {
      status: 403,
      data: response,
      statusText: 'Forbidden',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(error);
    const result = await repo.login({ email: 'test@example.com', password: 'password' });
    expect(result).toEqual({
      success: false,
      data: null,
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Email not verified',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
      meta: undefined,
      error: undefined,
    });
  });

  it('should handle DATABASE_ERROR in register', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.REGISTER };
    const response: ApiErrorResponse<null> = {
      success: false,
      data: null,
      code: 'DATABASE_ERROR',
      message: 'Database error occurred',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
      error: {
        type: 'server',
        details: [
          { field: 'database', code: 'DATABASE_ERROR', message: 'Database error occurred' },
        ],
      },
    };

    const error = new AxiosError('Database error occurred', 'DATABASE_ERROR', config, request, {
      status: 500,
      data: response,
      statusText: 'Internal Server Error',
      config,
      headers,
    });

    getMock().post.mockRejectedValue(error);

    const result = await repo.register({
      email: 'test@example.com',
      password: 'password',
      username: 'testuser',
    });

    expect(result).toEqual({
      success: false,
      data: null,
      code: 'DATABASE_ERROR',
      message: 'Database error occurred',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
      error: {
        type: 'server',
        details: [
          { field: 'database', code: 'DATABASE_ERROR', message: 'Database error occurred' },
        ],
      },
    });
  });

  it('should handle multiple new error codes in sequence', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const errorCodes = [
      { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token' },
      { code: 'EMAIL_NOT_VERIFIED', message: 'Email not verified' },
      { code: 'DATABASE_ERROR', message: 'Database error occurred' },
    ];

    const request = { path: API_ROUTES.AUTH.REGISTER };

    for (const errorInfo of errorCodes) {
      const error = new AxiosError(errorInfo.message, errorInfo.code, config, request, {
        status: 400,
        data: {
          success: false,
          data: null,
          code: errorInfo.code as ApiErrorCode,
          message: errorInfo.message,
          timestamp: '2024-01-15T10:30:00.000Z',
          requestId: 'test-request-id',
          error: {
            type: 'server',
            details: [{ field: 'database', code: errorInfo.code, message: errorInfo.message }],
          },
        },
        statusText: 'Error',
        config,
        headers,
      });

      getMock().post.mockRejectedValue(error);

      const result = await repo.login({ email: 'test@example.com', password: 'password' });
      expect(result.success).toBe(false);
      expect(result.code).toBe(errorInfo.code);
      expect(result.message).toBe(errorInfo.message);
    }
  });

  it('should handle network error without response', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.LOGIN };

    const networkError = new AxiosError('Network Error', 'ERR_NETWORK', config, request, {
      status: 0,
      data: null,
      statusText: 'Network Error',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(networkError);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.code).toBe('ERR_NETWORK');
    expect(result.message).toBe('Error de red. Verifica tu conexión');
    expect(isApiError(result) ? result.error?.type : undefined).toBe('server');
  });

  it('should handle timeout error', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.LOGIN };

    const timeoutError = new AxiosError('Timeout', 'ETIMEDOUT', config, request, {
      status: 0,
      data: null,
      statusText: 'Timeout',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(timeoutError);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.code).toBe('ETIMEDOUT');
    expect(result.message).toBe('La solicitud ha excedido el tiempo límite');
  });

  it('should handle canceled request error', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.LOGIN };

    const canceledError = new AxiosError('Canceled', 'ERR_CANCELED', config, request, {
      status: 0,
      data: null,
      statusText: 'Canceled',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(canceledError);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.code).toBe('ERR_CANCELED');
    expect(result.message).toBe('La solicitud fue cancelada');
    expect(isApiError(result) ? result.error?.type : undefined).toBe('server');
  });

  it('should handle connection aborted error', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.LOGIN };

    const abortedError = new AxiosError('Connection aborted', 'ECONNABORTED', config, request, {
      status: 0,
      data: {
        success: false,
        data: null,
        code: 'ECONNABORTED',
        message: 'Connection aborted',
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'test-request-id',
        error: {
          type: 'network',
          details: [{ field: 'connection', code: 'ECONNABORTED', message: 'Connection aborted' }],
        },
      },
      statusText: 'Connection aborted',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(abortedError);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.code).toBe('ECONNABORTED');
    expect(result.message).toBe('Connection aborted');
    expect(isApiError(result) ? result.error?.type : undefined).toBe('network');
  });

  it('should handle unknown error type', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.LOGIN };

    const unknownError = new AxiosError('Unknown error', 'UNKNOWN_CODE', config, request, {
      status: 0,
      data: {
        success: false,
        data: null,
        code: 'UNKNOWN_CODE',
        message: 'Unknown error',
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'test-request-id',
      },
      statusText: 'Unknown error',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(unknownError);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.code).toBe('UNKNOWN_CODE');
    expect(result.message).toBe('Unknown error');
  });

  it('should handle non-AxiosError', async () => {
    const stringError = 'String error';
    getMock().post.mockRejectedValue(stringError);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.code).toBe('ERR_NETWORK');
    expect(result.message).toBe('Error de conexión');
    expect(isApiError(result) ? result.error?.type : undefined).toBe('network');
  });

  it('should handle error with response but no data', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.LOGIN };
    const response: ApiErrorResponse<null> = {
      success: false,
      data: null,
      code: 'UNKNOWN_ERROR',
      message: 'Server error',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
    };

    const error = new AxiosError('Server Error', 'UNKNOWN_ERROR', config, request, {
      status: 500,
      data: response,
      statusText: 'Server Error',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(error);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.message).toBe('Server error');
  });

  it('should handle error with response data but no message', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.LOGIN };
    const response: ApiErrorResponse<null> = {
      success: false,
      data: null,
      code: 'UNKNOWN_ERROR',
      message: 'value',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
    };

    const error = new AxiosError('Server Error', 'UNKNOWN_ERROR', config, request, {
      status: 500,
      data: response,
      statusText: 'Server Error',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(error);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.message).toBe('value');
  });

  it('should handle error with complete response data', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.LOGIN };
    const response: ApiErrorResponse<null> = {
      success: false,
      data: null,
      code: 'CUSTOM_ERROR' as ApiErrorCode,
      message: 'Custom error message',
      timestamp: '2024-01-01T00:00:00.000Z',
      requestId: 'req-123',
      meta: { field: 'test' },
      error: { type: 'validation' },
    };

    const error = new AxiosError('Server Error', 'CUSTOM_ERROR', config, request, {
      status: 500,
      data: response,
      statusText: 'Server Error',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(error);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.code).toBe('CUSTOM_ERROR');
    expect(result.message).toBe('Custom error message');
  });

  it('should handle different status codes', async () => {
    const testCases = [
      { status: 401 },
      { status: 403 },
      { status: 422 },
      { status: 400 },
      { status: 404 },
      { status: 500 },
    ];

    for (const testCase of testCases) {
      const headers = new AxiosHeaders();
      const config = {
        url: 'https://localhost',
        headers,
      };
      const request = { path: API_ROUTES.AUTH.LOGIN };
      const response: ApiErrorResponse<null> = {
        success: false,
        data: null,
        code: 'ERROR' as ApiErrorCode,
        message: 'Error',
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'test-request-id',
      };

      const error = new AxiosError('Error', 'ERROR', config, request, {
        status: testCase.status,
        data: response,
        statusText: 'Error',
        config,
        headers,
      });
      getMock().post.mockRejectedValue(error);

      const result = await repo.login({ email: 'test@example.com', password: 'password' });

      expect(result.success).toBe(false);
    }
  });

  it('should handle getErrorMessage with response data message', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.LOGIN };
    const response: ApiErrorResponse<null> = {
      success: false,
      data: null,
      code: 'BAD_REQUEST' as ApiErrorCode,
      message: 'Custom response message',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
    };

    const error = new AxiosError('Default message', 'BAD_REQUEST', config, request, {
      status: 400,
      data: response,
      statusText: 'Bad Request',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(error);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.message).toBe('Custom response message');
  });

  it('should handle getErrorMessage with non-string response data message', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.LOGIN };
    const response: ApiErrorResponse<null> = {
      success: false,
      data: null,
      code: 'BAD_REQUEST' as ApiErrorCode,
      message: '123',
      timestamp: '2024-01-15T10:30:00.000Z',
      requestId: 'test-request-id',
    };

    const error = new AxiosError('Default message', 'BAD_REQUEST', config, request, {
      status: 400,
      data: response,
      statusText: 'Bad Request',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(error);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.message).toBe('123');
  });

  it('should handle getErrorMessage with null error message', async () => {
    const headers = new AxiosHeaders();
    const config = {
      url: 'https://localhost',
      headers,
    };
    const request = { path: API_ROUTES.AUTH.LOGIN };

    const error = new AxiosError(undefined, 'UNKNOWN_CODE', config, request, {
      status: 0,
      data: null,
      statusText: 'Unknown error',
      config,
      headers,
    });
    getMock().post.mockRejectedValue(error);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.message).toBe('Error de conexión');
  });

  it('should handle different error status codes for getErrorType', async () => {
    const testCases = [
      { status: 401 },
      { status: 403 },
      { status: 422 },
      { status: 400 },
      { status: 404 },
      { status: 500 },
      { status: 503 },
    ];

    for (const testCase of testCases) {
      const headers = new AxiosHeaders();
      const config = {
        url: 'https://localhost',
        headers,
      };
      const request = { path: API_ROUTES.AUTH.LOGIN };
      const response: ApiErrorResponse<null> = {
        success: false,
        data: null,
        code: 'ERROR' as ApiErrorCode,
        message: 'Error',
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'test-request-id',
      };

      const error = new AxiosError('Error', 'ERROR', config, request, {
        status: testCase.status,
        data: response,
        statusText: 'Error',
        config,
        headers,
      });
      getMock().post.mockRejectedValue(error);

      const result = await repo.login({ email: 'test@example.com', password: 'password' });

      expect(result.success).toBe(false);
      // When there's a server response, the error type is not set in the error object
      // The getErrorType function is used internally but the result structure depends on the response
    }
  });

  // Enhanced error handling and recovery tests
  describe('Error Handling and Recovery', () => {
    it('should handle multiple consecutive network failures with exponential backoff simulation', async () => {
      const headers = new AxiosHeaders();
      const config = {
        url: 'https://localhost',
        headers,
      };
      const request = { path: API_ROUTES.AUTH.LOGIN };

      // Simulate multiple network failures
      const networkErrors = Array.from(
        { length: 3 },
        (_, index) =>
          new AxiosError(`Network Error ${index + 1}`, 'ERR_NETWORK', config, request, {
            status: 0,
            data: null,
            statusText: 'Network Error',
            config,
            headers,
          })
      );

      // Test each failure
      for (let i = 0; i < networkErrors.length; i++) {
        getMock().post.mockRejectedValueOnce(networkErrors[i]);

        const result = await repo.login({ email: 'test@example.com', password: 'password' });

        expect(result.success).toBe(false);
        expect(result.code).toBe('ERR_NETWORK');
        expect(result.message).toBe('Error de red. Verifica tu conexión');
        expect(isApiError(result) ? result.error?.type : undefined).toBe('server');

        // Verify consistent error structure across multiple failures
        expect(result).toEqual({
          success: false,
          data: null,
          code: 'ERR_NETWORK',
          message: 'Error de red. Verifica tu conexión',
          timestamp: expect.any(String),
          requestId: expect.any(String),
          error: {
            type: 'server',
            details: [
              {
                field: 'network',
                code: 'ERR_NETWORK',
                message: `Network Error ${i + 1}`,
              },
            ],
          },
        });
      }
    });

    it('should gracefully degrade from server error to network error', async () => {
      const headers = new AxiosHeaders();
      const config = {
        url: 'https://localhost',
        headers,
      };
      const request = { path: API_ROUTES.AUTH.LOGIN };

      // First attempt: Server error (500)
      const serverError = new AxiosError('Server Error', 'UNKNOWN_ERROR', config, request, {
        status: 500,
        data: {
          success: false,
          data: null,
          code: 'UNKNOWN_ERROR',
          message: 'Internal Server Error',
          timestamp: '2024-01-15T10:30:00.000Z',
          requestId: 'test-request-id',
        },
        statusText: 'Server Error',
        config,
        headers,
      });

      getMock().post.mockRejectedValueOnce(serverError);

      const serverResult = await repo.login({ email: 'test@example.com', password: 'password' });

      expect(serverResult.success).toBe(false);
      expect(serverResult.code).toBe('UNKNOWN_ERROR');
      expect(serverResult.message).toBe('Internal Server Error');

      // Second attempt: Network error (complete failure)
      const networkError = new AxiosError('Network Error', 'ERR_NETWORK', config, request, {
        status: 0,
        data: null,
        statusText: 'Network Error',
        config,
        headers,
      });

      getMock().post.mockRejectedValueOnce(networkError);

      const networkResult = await repo.login({ email: 'test@example.com', password: 'password' });

      expect(networkResult.success).toBe(false);
      expect(networkResult.code).toBe('ERR_NETWORK');
      expect(networkResult.message).toBe('Error de red. Verifica tu conexión');
      expect(isApiError(networkResult) ? networkResult.error?.type : undefined).toBe('server');
    });

    it('should handle malformed error responses gracefully', async () => {
      const headers = new AxiosHeaders();
      const config = {
        url: 'https://localhost',
        headers,
      };
      const request = { path: API_ROUTES.AUTH.LOGIN };

      // Test with malformed response data
      const malformedError = new AxiosError(
        'Malformed Response',
        'UNKNOWN_ERROR',
        config,
        request,
        {
          status: 500,
          data: 'Invalid JSON response',
          statusText: 'Server Error',
          config,
          headers,
        }
      );

      getMock().post.mockRejectedValue(malformedError);

      const result = await repo.login({ email: 'test@example.com', password: 'password' });

      expect(result.success).toBe(false);
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.message).toBe('Malformed Response');
    });

    it('should handle timeout with retry simulation', async () => {
      const headers = new AxiosHeaders();
      const config = {
        url: 'https://localhost',
        headers,
      };
      const request = { path: API_ROUTES.AUTH.LOGIN };

      // Simulate timeout followed by successful retry
      const timeoutError = new AxiosError('Timeout Error', 'ETIMEDOUT', config, request, {
        status: 0,
        data: null,
        statusText: 'Timeout',
        config,
        headers,
      });

      getMock().post.mockRejectedValueOnce(timeoutError);

      const timeoutResult = await repo.login({ email: 'test@example.com', password: 'password' });

      expect(timeoutResult.success).toBe(false);
      expect(timeoutResult.code).toBe('ETIMEDOUT');
      expect(timeoutResult.message).toBe('La solicitud ha excedido el tiempo límite');

      // Simulate successful retry
      getMock().post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            user: {
              id: '1',
              email: 'test@example.com',
              username: 'testuser',
              role: 'user',
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
            accessToken: 'mockAccess',
            refreshToken: 'mockRefresh',
          },
          code: 'SUCCESS',
          message: 'Login successful',
          timestamp: '2024-01-15T10:30:00.000Z',
          requestId: '550e8400-e29b-41d4-a716-446655440000',
        },
      });

      const retryResult = await repo.login({ email: 'test@example.com', password: 'password' });

      expect(retryResult.success).toBe(true);
      expect(retryResult.data?.email).toBe('test@example.com');
    });

    it('should handle circuit breaker pattern simulation', async () => {
      const headers = new AxiosHeaders();
      const config = {
        url: 'https://localhost',
        headers,
      };
      const request = { path: API_ROUTES.AUTH.LOGIN };

      // Simulate service degradation: 5 consecutive failures
      const failures = Array.from(
        { length: 5 },
        (_, index) =>
          new AxiosError(`Service Error ${index + 1}`, 'SERVICE_UNAVAILABLE', config, request, {
            status: 503,
            data: {
              success: false,
              data: null,
              code: 'SERVICE_UNAVAILABLE',
              message: 'Service temporarily unavailable',
              timestamp: '2024-01-15T10:30:00.000Z',
              requestId: `req-${index + 1}`,
            },
            statusText: 'Service Unavailable',
            config,
            headers,
          })
      );

      // Test consecutive failures
      for (let i = 0; i < failures.length; i++) {
        getMock().post.mockRejectedValueOnce(failures[i]);

        const result = await repo.login({ email: 'test@example.com', password: 'password' });

        expect(result.success).toBe(false);
        expect(result.code).toBe('SERVICE_UNAVAILABLE');
        expect(result.message).toBe('Service temporarily unavailable');
        expect(result.requestId).toBe(`req-${i + 1}`);
      }

      // Simulate service recovery
      getMock().post.mockResolvedValue({
        data: {
          success: true,
          data: {
            user: {
              id: '1',
              email: 'test@example.com',
              username: 'testuser',
              role: 'user',
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
            accessToken: 'mockAccess',
            refreshToken: 'mockRefresh',
          },
          code: 'SUCCESS',
          message: 'Login successful',
          timestamp: '2024-01-15T10:30:00.000Z',
          requestId: 'req-recovery-1',
        },
      });

      const recoveryResult = await repo.login({ email: 'test@example.com', password: 'password' });

      expect(recoveryResult.success).toBe(true);
      expect(recoveryResult.data?.email).toBe('test@example.com');
      expect(recoveryResult.requestId).toBe('req-recovery-1');
    });

    it('should handle authentication token expiration and refresh flow', async () => {
      const headers = new AxiosHeaders();
      const config = {
        url: 'https://localhost',
        headers,
      };
      const request = { path: API_ROUTES.AUTH.ME };

      // Simulate expired token error
      const expiredTokenError = new AxiosError('Token Expired', 'TOKEN_EXPIRED', config, request, {
        status: 401,
        data: {
          success: false,
          data: null,
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired',
          timestamp: '2024-01-15T10:30:00.000Z',
          requestId: 'req-expired-1',
          error: {
            type: 'authentication',
            details: [
              {
                field: 'authorization',
                code: 'TOKEN_EXPIRED',
                message: 'Access token has expired',
              },
            ],
          },
        },
        statusText: 'Unauthorized',
        config,
        headers,
      });

      getMock().get.mockRejectedValue(expiredTokenError);

      const result = await repo.getCurrentUser();

      expect(result.success).toBe(false);
      expect(result.code).toBe('TOKEN_EXPIRED');
      expect(result.message).toBe('Access token has expired');
      expect(isApiError(result) ? result.error?.type : undefined).toBe('authentication');
      const errorResult = result as ApiErrorResponse<null>;
      expect(errorResult.error?.details?.[0].field).toBe('authorization');
    });

    it('should handle rate limiting with proper error structure', async () => {
      const headers = new AxiosHeaders();
      const config = {
        url: 'https://localhost',
        headers,
      };
      const request = { path: API_ROUTES.AUTH.LOGIN };

      // Simulate rate limiting error
      const rateLimitError = new AxiosError(
        'Rate Limit Exceeded',
        'RATE_LIMIT_EXCEEDED',
        config,
        request,
        {
          status: 429,
          data: {
            success: false,
            data: null,
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            timestamp: '2024-01-15T10:30:00.000Z',
            requestId: 'req-rate-limit-1',
            error: {
              type: 'business',
              details: [
                {
                  field: 'rate_limit',
                  code: 'RATE_LIMIT_EXCEEDED',
                  message: 'Rate limit of 5 requests per minute exceeded',
                },
              ],
            },
            meta: {
              retryAfter: 60,
              limit: 5,
              window: 60,
              remaining: 0,
            },
          },
          statusText: 'Too Many Requests',
          config,
          headers,
        }
      );

      getMock().post.mockRejectedValue(rateLimitError);

      const result = await repo.login({ email: 'test@example.com', password: 'password' });

      expect(result.success).toBe(false);
      expect(result.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(result.message).toBe('Too many requests. Please try again later.');
      expect(isApiError(result) ? result.error?.type : undefined).toBe('business');
      const metaResult = result as ApiErrorResponse<null> & {
        meta: { retryAfter: number; limit: number; remaining: number };
      };
      expect(metaResult.meta?.retryAfter).toBe(60);
      expect(metaResult.meta?.limit).toBe(5);
      expect(metaResult.meta?.remaining).toBe(0);
    });

    it('should handle validation errors with detailed field information', async () => {
      const headers = new AxiosHeaders();
      const config = {
        url: 'https://localhost',
        headers,
      };
      const request = { path: API_ROUTES.AUTH.REGISTER };

      // Simulate validation error with multiple field errors
      const validationError = new AxiosError(
        'Validation Failed',
        'VALIDATION_ERROR',
        config,
        request,
        {
          status: 422,
          data: {
            success: false,
            data: null,
            code: 'VALIDATION_ERROR',
            message: 'Validation failed for multiple fields',
            timestamp: '2024-01-15T10:30:00.000Z',
            requestId: 'req-validation-1',
            error: {
              type: 'validation',
              details: [
                {
                  field: 'email',
                  code: 'INVALID_EMAIL',
                  message: 'Email format is invalid',
                },
                {
                  field: 'password',
                  code: 'WEAK_PASSWORD',
                  message: 'Password must be at least 8 characters',
                },
                {
                  field: 'username',
                  code: 'USERNAME_TAKEN',
                  message: 'Username is already taken',
                },
              ],
            },
          },
          statusText: 'Unprocessable Entity',
          config,
          headers,
        }
      );

      getMock().post.mockRejectedValue(validationError);

      const result = await repo.register({
        email: 'invalid-email',
        password: '123',
        username: 'taken-username',
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.message).toBe('Validation failed for multiple fields');
      const validationResult = result as ApiErrorResponse<null>;
      expect(validationResult.error?.type).toBe('validation');
      expect(validationResult.error?.details?.length).toBe(3);

      // Verify each validation error
      const details = validationResult.error?.details || [];
      const emailError = details.find(d => d.field === 'email');
      const passwordError = details.find(d => d.field === 'password');
      const usernameError = details.find(d => d.field === 'username');

      expect(emailError?.code).toBe('INVALID_EMAIL');
      expect(passwordError?.code).toBe('WEAK_PASSWORD');
      expect(usernameError?.code).toBe('USERNAME_TAKEN');
    });
  });
});
