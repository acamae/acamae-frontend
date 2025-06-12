import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { USER_ROLES } from '@domain/constants/user';
import { AuthApiRepository } from '@infrastructure/api/AuthApiRepository';
import { API_ROUTES } from '@shared/constants/apiRoutes';

interface MockAxios {
  post: jest.Mock;
  get: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
}

interface MockAxiosError extends AxiosError {
  response?: AxiosResponse<{ message: string }>;
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

let mockAxios: MockAxios;

const getMock = () => {
  if (!mockAxios) {
    mockAxios = jest.requireMock('@shared/services/axiosService').default;
  }
  return mockAxios;
};

const repo = new AuthApiRepository();

const userResponse = {
  id: '1',
  email: 'a@b.com',
  username: 'alice',
  role: USER_ROLES.USER,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AuthApiRepository', () => {
  it('should login and map the response correctly', async () => {
    getMock().post.mockResolvedValue({ data: userResponse, status: 200 });

    const result = await repo.login({ email: 'a@b.com', password: '123456' });

    expect(getMock().post).toHaveBeenCalledWith(API_ROUTES.AUTH.LOGIN, {
      email: 'a@b.com',
      password: '123456',
    });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe('a@b.com');
  });

  it('should login and return success=false when http 400', async () => {
    const error = new AxiosError('Bad request') as MockAxiosError;
    error.response = {
      status: 400,
      data: { message: 'Bad' },
      statusText: 'Bad Request',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().post.mockRejectedValue(error);

    const result = await repo.login({ email: 'a@b.com', password: '123456' });

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
  });

  it('should forgotPassword and return success=false when network error', async () => {
    const netErr = new AxiosError('Network') as MockAxiosError;
    netErr.request = {};
    getMock().post.mockRejectedValue(netErr);

    const result = await repo.forgotPassword({ email: 'a@b.com' });

    expect(getMock().post).toHaveBeenCalledWith(API_ROUTES.AUTH.FORGOT_PASSWORD, {
      email: 'a@b.com',
    });
    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
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
    const result = await repo.logout();
    expect(getMock().post).toHaveBeenCalledWith(API_ROUTES.AUTH.LOGOUT);
    expect(result.success).toBe(true);
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

  it('should handleApiError and handle response error', async () => {
    const error = new AxiosError('Server Error') as MockAxiosError;
    error.response = {
      status: 500,
      data: { message: 'Internal Server Error' },
      statusText: 'Server Error',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().get.mockRejectedValue(error);
    const result = await repo.getCurrentUser();
    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
  });

  it('should handleApiError and handle network error', async () => {
    const error = new AxiosError('Network Error') as MockAxiosError;
    error.request = {};
    getMock().get.mockRejectedValue(error);
    const result = await repo.getCurrentUser();
    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.code).toBe('ERR_BAD_REQUEST');
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

  it('should findById and return error', async () => {
    const error = new AxiosError('Not Found') as MockAxiosError;
    error.response = {
      status: 404,
      data: { message: 'User not found' },
      statusText: 'Not Found',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().get.mockRejectedValue(error);
    const result = await repo.findById('1');
    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
  });

  it('should save and return success', async () => {
    const updatedUser = { ...userResponse, username: 'updated' };
    getMock().put.mockResolvedValue({ data: updatedUser, status: 200 });
    const result = await repo.save({
      id: '1',
      email: 'a@b.com',
      username: 'updated',
      role: USER_ROLES.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
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

  it('should save and return error', async () => {
    const error = new AxiosError('Bad Request') as MockAxiosError;
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
  });

  it('should delete and return success', async () => {
    getMock().delete.mockResolvedValue({ data: undefined, status: 204 });
    const result = await repo.delete('1');
    expect(getMock().delete).toHaveBeenCalledWith(expect.stringContaining('/users/1'));
    expect(result.success).toBe(true);
    expect(result.status).toBe(204);
  });

  it('should delete and return error', async () => {
    const error = new AxiosError('Not Found') as MockAxiosError;
    error.response = {
      status: 404,
      data: { message: 'User not found' },
      statusText: 'Not Found',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().delete.mockRejectedValue(error);
    const result = await repo.delete('1');
    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
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

  it('should resetPassword and return error', async () => {
    const error = new AxiosError('Invalid token') as MockAxiosError;
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
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
  });

  it('should logout and return error', async () => {
    const error = new AxiosError('Server Error') as MockAxiosError;
    error.response = {
      status: 500,
      data: { message: 'Internal Server Error' },
      statusText: 'Server Error',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().post.mockRejectedValue(error);
    const result = await repo.logout();
    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
  });

  it('should getCurrentUser and return error', async () => {
    const error = new AxiosError('Unauthorized') as MockAxiosError;
    error.response = {
      status: 401,
      data: { message: 'Not authenticated' },
      statusText: 'Unauthorized',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    getMock().get.mockRejectedValue(error);
    const result = await repo.getCurrentUser();
    expect(result.success).toBe(false);
    expect(result.status).toBe(401);
  });

  it('should findById and return error with network issue', async () => {
    const error = new AxiosError('Network Error') as MockAxiosError;
    error.request = {};
    getMock().get.mockRejectedValue(error);
    const result = await repo.findById('1');
    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.code).toBe('ERR_BAD_REQUEST');
  });
});
