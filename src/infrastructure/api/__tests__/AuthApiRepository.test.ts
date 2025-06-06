let mockAxios: any;

import { AxiosError } from 'axios';
import { AuthApiRepository } from '@infrastructure/api/AuthApiRepository';
import { API_ROUTES } from '@shared/constants/apiRoutes';
import { USER_ROLES } from '@domain/constants/user';

jest.mock('@shared/services/axiosService', () => {
  const instance = {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
  mockAxios = instance;
  return { __esModule: true, default: instance };
});

const getMock = () => mockAxios;

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
  it('login – success mapea correctamente la respuesta', async () => {
    getMock().post.mockResolvedValue({ data: userResponse, status: 200 });

    const result = await repo.login({ email: 'a@b.com', password: '123456' });

    expect(getMock().post).toHaveBeenCalledWith(API_ROUTES.AUTH.LOGIN, { email: 'a@b.com', password: '123456' });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe('a@b.com');
  });

  it('login – error http 400 devuelve success=false', async () => {
    const error = new AxiosError('Bad request');
    (error as any).response = { status: 400, data: { message: 'Bad' } };
    getMock().post.mockRejectedValue(error);

    const result = await repo.login({ email: 'a@b.com', password: '123456' });

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
  });

  it('forgotPassword – network error devuelve success=false status 500', async () => {
    const netErr = new AxiosError('Network');
    (netErr as any).request = {};
    getMock().post.mockRejectedValue(netErr);

    const result = await repo.forgotPassword({ email: 'a@b.com' });

    expect(getMock().post).toHaveBeenCalledWith(API_ROUTES.AUTH.FORGOT_PASSWORD, { email: 'a@b.com' });
    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
  });

  it('register – success', async () => {
    getMock().post.mockResolvedValue({ data: userResponse, status: 201 });
    const result = await repo.register({ email: 'x@y.com', password: 'pwd', username: 'user' });
    expect(getMock().post).toHaveBeenCalledWith(API_ROUTES.AUTH.REGISTER, {
      email: 'x@y.com',
      password: 'pwd',
      username: 'user',
    });
    expect(result.success).toBe(true);
  });

  it('logout – success', async () => {
    getMock().post.mockResolvedValue({ data: undefined, status: 200 });
    const result = await repo.logout();
    expect(getMock().post).toHaveBeenCalledWith(API_ROUTES.AUTH.LOGOUT);
    expect(result.success).toBe(true);
  });

  it('findAll – devuelve arreglo de usuarios', async () => {
    getMock().get.mockResolvedValue({ data: [userResponse], status: 200 });
    const result = await repo.findAll();
    expect(getMock().get).toHaveBeenCalledWith(API_ROUTES.USERS.GET_ALL);
    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(1);
  });

  it('handleApiSuccess - mapea correctamente respuesta exitosa', async () => {
    getMock().get.mockResolvedValue({ data: userResponse, status: 200 });
    const result = await repo.getCurrentUser();
    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data).toEqual(expect.objectContaining({
      email: userResponse.email,
      username: userResponse.username,
    }));
  });

  it('handleApiError - maneja error de respuesta', async () => {
    const error = new AxiosError('Server Error');
    (error as any).response = { status: 500, data: { message: 'Internal Server Error' } };
    getMock().get.mockRejectedValue(error);
    const result = await repo.getCurrentUser();
    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
  });

  it('handleApiError - maneja error de red', async () => {
    const error = new AxiosError('Network Error');
    (error as any).request = {};
    getMock().get.mockRejectedValue(error);
    const result = await repo.getCurrentUser();
    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.code).toBe('REQUEST_ERROR');
  });

  it('handleApiError - maneja error desconocido', async () => {
    getMock().get.mockRejectedValue(new Error('Unknown Error'));
    const result = await repo.getCurrentUser();
    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.code).toBe('UNKNOWN_ERROR');
  });

  it('findById - success', async () => {
    getMock().get.mockResolvedValue({ data: userResponse, status: 200 });
    const result = await repo.findById('1');
    expect(getMock().get).toHaveBeenCalledWith(expect.stringContaining('/users/1'));
    expect(result.success).toBe(true);
    expect(result.data).toEqual(expect.objectContaining({
      id: '1',
      email: userResponse.email,
    }));
  });

  it('findById - error', async () => {
    const error = new AxiosError('Not Found');
    (error as any).response = { status: 404, data: { message: 'User not found' } };
    getMock().get.mockRejectedValue(error);
    const result = await repo.findById('1');
    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
  });

  it('save - success', async () => {
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

  it('save - error', async () => {
    const error = new AxiosError('Bad Request');
    (error as any).response = { status: 400, data: { message: 'Invalid data' } };
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

  it('delete - success', async () => {
    getMock().delete.mockResolvedValue({ data: undefined, status: 204 });
    const result = await repo.delete('1');
    expect(getMock().delete).toHaveBeenCalledWith(expect.stringContaining('/users/1'));
    expect(result.success).toBe(true);
    expect(result.status).toBe(204);
  });

  it('delete - error', async () => {
    const error = new AxiosError('Not Found');
    (error as any).response = { status: 404, data: { message: 'User not found' } };
    getMock().delete.mockRejectedValue(error);
    const result = await repo.delete('1');
    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
  });

  it('resetPassword - success', async () => {
    getMock().post.mockResolvedValue({ data: undefined, status: 200 });
    const result = await repo.resetPassword({ token: 'valid-token', newPassword: 'new-password' });
    expect(getMock().post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/reset-password/valid-token'),
      { newPassword: 'new-password' }
    );
    expect(result.success).toBe(true);
  });

  it('resetPassword - error', async () => {
    const error = new AxiosError('Invalid token');
    (error as any).response = { status: 400, data: { message: 'Invalid or expired token' } };
    getMock().post.mockRejectedValue(error);
    const result = await repo.resetPassword({ token: 'invalid-token', newPassword: 'new-password' });
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
  });

  it('logout - error', async () => {
    const error = new AxiosError('Server Error');
    (error as any).response = { status: 500, data: { message: 'Internal Server Error' } };
    getMock().post.mockRejectedValue(error);
    const result = await repo.logout();
    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
  });

  it('getCurrentUser - error', async () => {
    const error = new AxiosError('Unauthorized');
    (error as any).response = { status: 401, data: { message: 'Not authenticated' } };
    getMock().get.mockRejectedValue(error);
    const result = await repo.getCurrentUser();
    expect(result.success).toBe(false);
    expect(result.status).toBe(401);
  });

  it('findById - error with network issue', async () => {
    const error = new AxiosError('Network Error');
    (error as any).request = {};
    getMock().get.mockRejectedValue(error);
    const result = await repo.findById('1');
    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.code).toBe('REQUEST_ERROR');
  });
}); 