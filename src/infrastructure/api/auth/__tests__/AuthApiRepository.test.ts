import { AuthApiRepository } from '@infrastructure/api/auth/AuthApiRepository';

jest.mock('@shared/services/axiosService', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@infrastructure/storage/tokenService', () => ({
  tokenService: {
    getRefreshToken: jest.fn(),
    setAccessToken: jest.fn(),
    setRefreshToken: jest.fn(),
    clear: jest.fn(),
  },
}));

describe('AuthApiRepository branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login success maps user and stores tokens', async () => {
    const api = require('@shared/services/axiosService').default;
    api.post.mockResolvedValueOnce({
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {
        success: true,
        data: {
          accessToken: 'acc',
          refreshToken: 'ref',
          user: {
            id: '1',
            email: 'a@b.c',
            username: 'u',
            role: 'USER',
            createdAt: 'now',
            updatedAt: 'now',
          },
        },
      },
    });
    const repo = new AuthApiRepository();
    const res = await repo.login({ email: 'a@b.c', password: 'p' });
    const { tokenService } = require('@infrastructure/storage/tokenService');
    expect(tokenService.setAccessToken).toHaveBeenCalledWith('acc');
    expect(tokenService.setRefreshToken).toHaveBeenCalledWith('ref');
    expect(res.success).toBe(true);
    expect((res.data as { email?: string } | null)?.email).toBe('a@b.c');
  });

  it('login network error maps to ApiErrorResponse with status 0', async () => {
    const api = require('@shared/services/axiosService').default;
    api.post.mockRejectedValueOnce({
      code: 'ERR_NETWORK',
      message: 'offline',
      config: { headers: {} },
    });
    const repo = new AuthApiRepository();
    const res = await repo.login({ email: 'x', password: 'y' });
    expect(res.success).toBe(false);
    expect(res.status).toBe(0);
  });

  it('getCurrentUser maps user correctly', async () => {
    const api = require('@shared/services/axiosService').default;
    api.get.mockResolvedValueOnce({
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {
        success: true,
        data: {
          id: '2',
          email: 'c@d.e',
          username: 'u2',
          role: 'admin',
          createdAt: 'now',
          updatedAt: 'now',
        },
      },
    });
    const repo = new AuthApiRepository();
    const res = await repo.getCurrentUser();
    expect(res.success).toBe(true);
    expect((res.data as { role?: string } | null)?.role).toBe('admin');
  });

  it('verifyEmail error with response maps code/message', async () => {
    const api = require('@shared/services/axiosService').default;
    api.get.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { success: false, data: null, code: 'AUTH_TOKEN_INVALID', message: 'invalid' },
      },
      config: { headers: {} },
      message: 'bad',
    });
    const repo = new AuthApiRepository();
    const res = await repo.verifyEmail({ token: 't' });
    expect(res.success).toBe(false);
    expect(res.code).toBe('AUTH_TOKEN_INVALID');
    expect(res.message).toBe('invalid');
  });

  it('logout clears token even on error', async () => {
    const api = require('@shared/services/axiosService').default;
    const { tokenService } = require('@infrastructure/storage/tokenService');
    tokenService.getRefreshToken.mockReturnValue('ref');
    api.post.mockRejectedValueOnce({});
    const repo = new AuthApiRepository();
    const res = await repo.logout();
    expect(res.success).toBe(false);
    expect(tokenService.clear).toHaveBeenCalled();
  });

  it('register success returns ApiSuccessResponse', async () => {
    const api = require('@shared/services/axiosService').default;
    api.post.mockResolvedValueOnce({
      status: 201,
      statusText: 'Created',
      headers: {},
      data: { success: true, data: null },
    });
    const repo = new AuthApiRepository();
    const res = await repo.register({ email: 'e', password: 'p', username: 'u' });
    expect(res.success).toBe(true);
  });

  it('resetPassword success returns ApiSuccessResponse', async () => {
    const api = require('@shared/services/axiosService').default;
    api.put.mockResolvedValueOnce({
      status: 200,
      statusText: 'OK',
      headers: {},
      data: { success: true, data: null },
    });
    const repo = new AuthApiRepository();
    const res = await repo.resetPassword({ token: 't', password: 'new' });
    expect(res.success).toBe(true);
  });

  it('findAll maps users array', async () => {
    const api = require('@shared/services/axiosService').default;
    api.get.mockResolvedValueOnce({
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {
        success: true,
        data: [
          { id: '1', email: 'a', username: 'u', role: 'USER', createdAt: 'x', updatedAt: 'y' },
        ],
      },
    });
    const repo = new AuthApiRepository();
    const res = await repo.findAll();
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('findById returns null when data is missing', async () => {
    const api = require('@shared/services/axiosService').default;
    api.get.mockResolvedValueOnce({
      status: 200,
      statusText: 'OK',
      headers: {},
      data: { success: true, data: null },
    });
    const repo = new AuthApiRepository();
    const res = await repo.findById('1');
    expect(res.success).toBe(true);
    expect(res.data).toBeNull();
  });

  it('save maps updated user', async () => {
    const api = require('@shared/services/axiosService').default;
    api.put.mockResolvedValueOnce({
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {
        success: true,
        data: { id: '1', email: 'z', username: 'u', role: 'USER', createdAt: 'x', updatedAt: 'y' },
      },
    });
    const repo = new AuthApiRepository();
    const res = await repo.save({ id: '1', email: 'z', username: 'u', role: 'user' });
    expect(res.success).toBe(true);
    expect((res.data as { email?: string } | null)?.email).toBe('z');
  });

  it('delete returns success', async () => {
    const api = require('@shared/services/axiosService').default;
    api.delete.mockResolvedValueOnce({
      status: 204,
      statusText: 'No Content',
      headers: {},
      data: { success: true, data: null },
    });
    const repo = new AuthApiRepository();
    const res = await repo.delete('1');
    expect(res.success).toBe(true);
  });
});
