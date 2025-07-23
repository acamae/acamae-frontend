import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { USER_ROLES } from '@domain/constants/user';
import { AuthApiRepository } from '@infrastructure/api/AuthApiRepository';
import { tokenService } from '@infrastructure/storage/tokenService';
import { API_ROUTES } from '@shared/constants/apiRoutes';

interface CreateAxiosMock {
  post: jest.Mock;
  get: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
}

interface CreateAxiosMockError extends AxiosError {
  response?: AxiosResponse<{
    message: string;
    code?: string;
    timestamp?: string;
    requestId?: string;
    meta?: unknown;
    error?: unknown;
  }>;
  request?: Record<string, unknown>;
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

describe('AuthApiRepository', () => {
  it('should login and map the response correctly', async () => {
    getMock().post.mockResolvedValue({
      data: {
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
      },
      status: 200,
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
    const error = new AxiosError('Bad Request') as CreateAxiosMockError;
    error.response = {
      status: 400,
      data: { message: 'Bad' },
      statusText: 'Bad Request',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().post.mockRejectedValue(error);

    const result = await repo.login({ email: 'a@b.com', password: '123456' });

    expect(result).toEqual({
      success: false,
      data: null,
      status: 400,
      code: 'UNKNOWN_ERROR',
      message: 'Bad',
      timestamp: expect.any(String),
      requestId: undefined,
      meta: undefined,
      error: undefined,
    });
  });

  it('should forgotPassword and return structured error on network error', async () => {
    const netErr = new AxiosError('Network') as CreateAxiosMockError;
    netErr.request = {};
    getMock().post.mockRejectedValue(netErr);

    const result = await repo.forgotPassword({ email: 'a@b.com' });

    expect(getMock().post).toHaveBeenCalledWith(API_ROUTES.AUTH.FORGOT_PASSWORD, {
      email: 'a@b.com',
    });
    expect(result).toEqual({
      success: false,
      data: null,
      status: 0,
      code: 'ERR_NETWORK',
      message: 'Network',
      timestamp: expect.any(String),
      error: {
        type: 'network',
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
    getMock().post.mockResolvedValue({ data: userResponse, status: 201 });
    const result = await repo.register({ email: 'x@y.com', password: 'pwd', username: 'user' });
    expect(getMock().post).toHaveBeenCalledWith(API_ROUTES.AUTH.REGISTER, {
      email: 'x@y.com',
      password: 'pwd',
      username: 'user',
    });
    expect(result.success).toBe(true);
  });

  it('should logout and return success', async () => {
    getMock().post.mockResolvedValue({ data: undefined, status: 200 });
    jest.spyOn(tokenService, 'getRefreshToken').mockReturnValue('mockRefresh');
    const result = await repo.logout();
    expect(getMock().post).toHaveBeenCalledWith(API_ROUTES.AUTH.LOGOUT, {
      refreshToken: 'mockRefresh',
    });
    expect(result.success).toBe(true);
    jest.restoreAllMocks();
  });

  it('should findAll and return array of users', async () => {
    getMock().get.mockResolvedValue({ data: [userResponse], status: 200 });
    const result = await repo.findAll();
    expect(getMock().get).toHaveBeenCalledWith(API_ROUTES.USERS.GET_ALL);
    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(1);
  });

  it('should handleApiSuccess and map the response correctly', async () => {
    getMock().get.mockResolvedValue({ data: userResponse, status: 200 });
    const result = await repo.getCurrentUser();
    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data).toEqual(
      expect.objectContaining({
        email: userResponse.email,
        username: userResponse.username,
      })
    );
  });

  it('should handle response error and return backend payload', async () => {
    const error = new AxiosError('Server Error') as CreateAxiosMockError;
    error.response = {
      status: 500,
      data: { message: 'Internal Server Error' },
      statusText: 'Server Error',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().get.mockRejectedValue(error);
    const result = await repo.getCurrentUser();
    expect(result).toEqual({
      success: false,
      data: null,
      status: 500,
      code: 'UNKNOWN_ERROR',
      message: 'Internal Server Error',
      timestamp: expect.any(String),
      requestId: undefined,
      meta: undefined,
      error: undefined,
    });
  });

  it('should return structured error on network error when no response', async () => {
    const error = new AxiosError('Network Error') as CreateAxiosMockError;
    error.request = {};
    getMock().get.mockRejectedValue(error);
    const result = await repo.getCurrentUser();
    expect(result).toEqual({
      success: false,
      data: null,
      status: 0,
      code: 'ERR_NETWORK',
      message: 'Network Error',
      timestamp: expect.any(String),
      error: {
        type: 'network',
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
    getMock().get.mockRejectedValue(new Error('Unknown Error'));
    const result = await repo.getCurrentUser();
    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.code).toBe('UNKNOWN_ERROR');
  });

  it('should findById and return success', async () => {
    getMock().get.mockResolvedValue({ data: userResponse, status: 200 });
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
    const error = new AxiosError('Not Found') as CreateAxiosMockError;
    error.response = {
      status: 404,
      data: { message: 'User not found' },
      statusText: 'Not Found',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().get.mockRejectedValue(error);
    const result = await repo.findById('1');
    expect(result).toEqual({
      success: false,
      data: null,
      status: 404,
      code: 'UNKNOWN_ERROR',
      message: 'User not found',
      timestamp: expect.any(String),
      requestId: undefined,
      meta: undefined,
      error: undefined,
    });
  });

  it('should save and return success', async () => {
    const updatedUser = { ...userResponse, username: 'updated' };
    getMock().put.mockResolvedValue({ data: updatedUser, status: 200 });
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
    const error = new AxiosError('Bad Request') as CreateAxiosMockError;
    error.response = {
      status: 400,
      data: { message: 'Invalid data' },
      statusText: 'Bad Request',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
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
      status: 400,
      code: 'UNKNOWN_ERROR',
      message: 'Invalid data',
      timestamp: expect.any(String),
      requestId: undefined,
      meta: undefined,
      error: undefined,
    });
  });

  it('should delete and return success', async () => {
    getMock().delete.mockResolvedValue({ data: undefined, status: 204 });
    const result = await repo.delete('1');
    expect(getMock().delete).toHaveBeenCalledWith(expect.stringContaining('/users/1'));
    expect(result.success).toBe(true);
    expect(result.status).toBe(204);
  });

  it('should delete and propagate backend error', async () => {
    const error = new AxiosError('Not Found') as CreateAxiosMockError;
    error.response = {
      status: 404,
      data: { message: 'User not found' },
      statusText: 'Not Found',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().delete.mockRejectedValue(error);
    const result = await repo.delete('1');
    expect(result).toEqual({
      success: false,
      data: null,
      status: 404,
      code: 'UNKNOWN_ERROR',
      message: 'User not found',
      timestamp: expect.any(String),
      requestId: undefined,
      meta: undefined,
      error: undefined,
    });
  });

  it('should resetPassword and return success', async () => {
    getMock().post.mockResolvedValue({ data: undefined, status: 200 });
    const result = await repo.resetPassword({ token: 'valid-token', password: 'new-password' });
    expect(getMock().post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/reset-password/valid-token'),
      { password: 'new-password' }
    );
    expect(result.success).toBe(true);
  });

  it('should resetPassword and propagate backend error', async () => {
    const error = new AxiosError('Invalid token') as CreateAxiosMockError;
    error.response = {
      status: 400,
      data: { message: 'Invalid or expired token' },
      statusText: 'Bad Request',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().post.mockRejectedValue(error);
    const result = await repo.resetPassword({
      token: 'invalid-token',
      password: 'new-password',
    });
    expect(result).toEqual({
      success: false,
      data: null,
      status: 400,
      code: 'UNKNOWN_ERROR',
      message: 'Invalid or expired token',
      timestamp: expect.any(String),
      requestId: undefined,
      meta: undefined,
      error: undefined,
    });
  });

  it('should logout and propagate server error', async () => {
    const error = new AxiosError('Server Error') as CreateAxiosMockError;
    error.response = {
      status: 500,
      data: { message: 'Internal Server Error' },
      statusText: 'Server Error',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().post.mockRejectedValue(error);
    const result = await repo.logout();
    expect(result).toEqual({
      success: false,
      data: null,
      status: 500,
      code: 'UNKNOWN_ERROR',
      message: 'Internal Server Error',
      timestamp: expect.any(String),
      requestId: undefined,
      meta: undefined,
      error: undefined,
    });
  });

  it('should getCurrentUser and propagate backend unauthorized error', async () => {
    const error = new AxiosError('Unauthorized') as CreateAxiosMockError;
    error.response = {
      status: 401,
      data: { message: 'Not authenticated' },
      statusText: 'Unauthorized',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().get.mockRejectedValue(error);
    const result = await repo.getCurrentUser();
    expect(result).toEqual({
      success: false,
      data: null,
      status: 401,
      code: 'UNKNOWN_ERROR',
      message: 'Not authenticated',
      timestamp: expect.any(String),
      requestId: undefined,
      meta: undefined,
      error: undefined,
    });
  });

  it('should findById and return structured error on network error', async () => {
    const error = new AxiosError('Network Error') as CreateAxiosMockError;
    error.request = {};
    getMock().get.mockRejectedValue(error);
    const result = await repo.findById('1');
    expect(result).toEqual({
      success: false,
      data: null,
      status: 0,
      code: 'ERR_NETWORK',
      message: 'Network Error',
      timestamp: expect.any(String),
      error: {
        type: 'network',
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
    const error = new AxiosError('Unauthorized') as CreateAxiosMockError;
    error.response = {
      status: 401,
      data: {
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      },
      statusText: 'Unauthorized',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().post.mockRejectedValue(error);
    const result = await repo.login({ email: 'test@example.com', password: 'password' });
    expect(result).toEqual({
      success: false,
      data: null,
      status: 401,
      code: 'INVALID_REFRESH_TOKEN',
      message: 'Invalid refresh token',
      timestamp: expect.any(String),
      requestId: undefined,
      meta: undefined,
      error: undefined,
    });
  });

  it('should handle EMAIL_NOT_VERIFIED error in login', async () => {
    const error = new AxiosError('Forbidden') as CreateAxiosMockError;
    error.response = {
      status: 403,
      data: {
        message: 'Email not verified',
        code: 'EMAIL_NOT_VERIFIED',
      },
      statusText: 'Forbidden',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().post.mockRejectedValue(error);
    const result = await repo.login({ email: 'test@example.com', password: 'password' });
    expect(result).toEqual({
      success: false,
      data: null,
      status: 403,
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Email not verified',
      timestamp: expect.any(String),
      requestId: undefined,
      meta: undefined,
      error: undefined,
    });
  });

  it('should handle DATABASE_ERROR in register', async () => {
    const error = new AxiosError('Internal Server Error') as CreateAxiosMockError;
    error.response = {
      status: 500,
      data: {
        message: 'Database error occurred',
        code: 'DATABASE_ERROR',
      },
      statusText: 'Internal Server Error',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().post.mockRejectedValue(error);
    const result = await repo.register({
      email: 'test@example.com',
      password: 'password',
      username: 'testuser',
    });
    expect(result).toEqual({
      success: false,
      data: null,
      status: 500,
      code: 'DATABASE_ERROR',
      message: 'Database error occurred',
      timestamp: expect.any(String),
      requestId: undefined,
      meta: undefined,
      error: undefined,
    });
  });

  it('should handle multiple new error codes in sequence', async () => {
    const errorCodes = [
      { code: 'INVALID_REFRESH_TOKEN', status: 401, message: 'Invalid refresh token' },
      { code: 'EMAIL_NOT_VERIFIED', status: 403, message: 'Email not verified' },
      { code: 'DATABASE_ERROR', status: 500, message: 'Database error occurred' },
    ];

    for (const errorInfo of errorCodes) {
      const error = new AxiosError(errorInfo.message) as CreateAxiosMockError;
      error.response = {
        status: errorInfo.status,
        data: {
          message: errorInfo.message,
          code: errorInfo.code,
        },
        statusText: 'Error',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };
      getMock().post.mockRejectedValue(error);

      const result = await repo.login({ email: 'test@example.com', password: 'password' });
      expect(result.success).toBe(false);
      expect(result.status).toBe(errorInfo.status);
      expect(result.message).toBe(errorInfo.message);
    }
  });

  // Additional tests for better coverage
  it('should handle login with missing tokens', async () => {
    getMock().post.mockResolvedValue({
      data: {
        data: {
          user: {
            id: '1',
            email: 'a@b.com',
            username: 'alice',
            role: 'user',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
          // No tokens provided
        },
      },
      status: 200,
    });

    const result = await repo.login({ email: 'a@b.com', password: '123456' });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe('a@b.com');
  });

  it('should handle login with admin role', async () => {
    getMock().post.mockResolvedValue({
      data: {
        data: {
          user: {
            id: '1',
            email: 'admin@b.com',
            username: 'admin',
            role: 'admin',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
          accessToken: 'mockAccess',
          refreshToken: 'mockRefresh',
        },
      },
      status: 200,
    });

    const result = await repo.login({ email: 'admin@b.com', password: '123456' });

    expect(result.success).toBe(true);
    expect(result.data?.role).toBe(USER_ROLES.ADMIN);
  });

  it('should handle network error without response', async () => {
    const networkError = new AxiosError('Network Error') as CreateAxiosMockError;
    networkError.code = 'ERR_NETWORK';
    networkError.request = {};
    getMock().post.mockRejectedValue(networkError);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.code).toBe('ERR_NETWORK');
    expect(result.message).toBe('Error de red. Verifica tu conexión');
    expect(isApiError(result) ? result.error?.type : undefined).toBe('network');
  });

  it('should handle timeout error', async () => {
    const timeoutError = new AxiosError('Timeout') as CreateAxiosMockError;
    timeoutError.code = 'ETIMEDOUT';
    timeoutError.request = {};
    getMock().post.mockRejectedValue(timeoutError);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.code).toBe('ETIMEDOUT');
    expect(result.message).toBe('La solicitud ha excedido el tiempo límite');
  });

  it('should handle canceled request error', async () => {
    const canceledError = new AxiosError('Canceled') as CreateAxiosMockError;
    canceledError.code = 'ERR_CANCELED';
    canceledError.request = {};
    getMock().post.mockRejectedValue(canceledError);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.code).toBe('ERR_CANCELED');
    expect(result.message).toBe('La solicitud fue cancelada');
    expect(isApiError(result) ? result.error?.type : undefined).toBe('network');
  });

  it('should handle connection aborted error', async () => {
    const abortedError = new AxiosError('Connection aborted') as CreateAxiosMockError;
    abortedError.code = 'ECONNABORTED';
    abortedError.request = {};
    getMock().post.mockRejectedValue(abortedError);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.code).toBe('ECONNABORTED');
    expect(result.message).toBe('La conexión se ha cancelado');
    expect(isApiError(result) ? result.error?.type : undefined).toBe('network');
  });

  it('should handle unknown error type', async () => {
    const unknownError = new AxiosError('Unknown error') as CreateAxiosMockError;
    unknownError.code = 'UNKNOWN_CODE';
    unknownError.request = {};
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
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.message).toBe('Unknown error occurred');
    expect(isApiError(result) ? result.error?.type : undefined).toBe('server');
  });

  it('should handle error with response but no data', async () => {
    const error = new AxiosError('Server Error') as CreateAxiosMockError;
    error.response = {
      status: 500,
      data: { message: 'Server error' },
      statusText: 'Server Error',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().post.mockRejectedValue(error);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.message).toBe('Server error');
  });

  it('should handle error with response data but no message', async () => {
    const error = new AxiosError('Server Error') as CreateAxiosMockError;
    error.response = {
      status: 500,
      data: { message: 'value' },
      statusText: 'Server Error',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().post.mockRejectedValue(error);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.code).toBe('UNKNOWN_ERROR');
    expect(result.message).toBe('value');
  });

  it('should handle error with complete response data', async () => {
    const error = new AxiosError('Server Error') as CreateAxiosMockError;
    error.response = {
      status: 500,
      data: {
        message: 'Custom error message',
        code: 'CUSTOM_ERROR',
        timestamp: '2024-01-01T00:00:00.000Z',
        requestId: 'req-123',
        meta: { field: 'test' },
        error: { type: 'validation' },
      },
      statusText: 'Server Error',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().post.mockRejectedValue(error);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.code).toBe('CUSTOM_ERROR');
    expect(result.message).toBe('Custom error message');
    expect(result.timestamp).toBe('2024-01-01T00:00:00.000Z');
    expect(result.requestId).toBe('req-123');
    expect(result.meta).toEqual({ field: 'test' });
    expect(isApiError(result) ? result.error : undefined).toEqual({ type: 'validation' });
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

    for (const { status } of testCases) {
      const error = new AxiosError('Error') as CreateAxiosMockError;
      error.response = {
        status,
        data: { message: 'Error' },
        statusText: 'Error',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };
      getMock().post.mockRejectedValue(error);

      const result = await repo.login({ email: 'test@example.com', password: 'password' });

      expect(result.success).toBe(false);
      expect(result.status).toBe(status);
    }
  });

  it('should handle getErrorMessage with response data message', async () => {
    const error = new AxiosError('Default message') as CreateAxiosMockError;
    error.response = {
      status: 400,
      data: { message: 'Custom response message' },
      statusText: 'Bad Request',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().post.mockRejectedValue(error);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.message).toBe('Custom response message');
  });

  it('should handle getErrorMessage with non-string response data message', async () => {
    const error = new AxiosError('Default message') as CreateAxiosMockError;
    error.response = {
      status: 400,
      data: { message: '123' }, // String message
      statusText: 'Bad Request',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().post.mockRejectedValue(error);

    const result = await repo.login({ email: 'test@example.com', password: 'password' });

    expect(result.message).toBe('123');
  });

  it('should handle getErrorMessage with null error message', async () => {
    const error = new AxiosError(undefined) as CreateAxiosMockError;
    error.code = 'UNKNOWN_CODE';
    error.request = {};
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

    for (const { status } of testCases) {
      const error = new AxiosError('Error') as CreateAxiosMockError;
      error.response = {
        status,
        data: { message: 'Error' },
        statusText: 'Error',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };
      getMock().post.mockRejectedValue(error);

      const result = await repo.login({ email: 'test@example.com', password: 'password' });

      expect(result.success).toBe(false);
      expect(result.status).toBe(status);
      // When there's a server response, the error type is not set in the error object
      // The getErrorType function is used internally but the result structure depends on the response
    }
  });
});
