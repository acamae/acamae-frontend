import { authPersistConfig } from '@application/state/persistConfig';

jest.mock('@infrastructure/storage/localStorageService', () => ({
  localStorageService: {
    get: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('@infrastructure/storage/sessionExpiryService', () => ({
  sessionExpiryService: {
    getExpiresAt: jest.fn(),
  },
}));

describe('authPersistConfig.migrate', () => {
  const { localStorageService } = require('@infrastructure/storage/localStorageService');
  const { sessionExpiryService } = require('@infrastructure/storage/sessionExpiryService');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return state as-is when state is undefined', async () => {
    const res = await authPersistConfig.migrate(undefined);
    expect(res).toBeUndefined();
  });

  it('should drop persisted auth when no refresh token or no expiresAt', async () => {
    (localStorageService.get as jest.Mock).mockReturnValueOnce(null);
    (sessionExpiryService.getExpiresAt as jest.Mock).mockReturnValueOnce(null);
    const res = await authPersistConfig.migrate({ _persist: { version: 2, rehydrated: true } });
    expect(res).toEqual({
      user: null,
      token: null,
      isAuthenticated: false,
      _persist: { version: 2, rehydrated: true },
    });
    expect(localStorageService.remove).toHaveBeenCalledWith('persist:auth');
    expect(localStorageService.remove).toHaveBeenCalledWith('__refreshToken__');
  });

  it('should drop persisted auth when session has expired (expiresAt <= now)', async () => {
    (localStorageService.get as jest.Mock).mockReturnValueOnce('r');
    (sessionExpiryService.getExpiresAt as jest.Mock).mockReturnValueOnce(Date.now() - 1000);
    const res = await authPersistConfig.migrate({ _persist: { version: 2, rehydrated: true } });
    expect(res).toMatchObject({ user: null, token: null, isAuthenticated: false });
  });

  it('should keep auth when refresh token exists and session not expired, coerces isAuthenticated', async () => {
    (localStorageService.get as jest.Mock).mockReturnValueOnce('r');
    (sessionExpiryService.getExpiresAt as jest.Mock).mockReturnValueOnce(Date.now() + 100000);
    const incoming = {
      user: { id: 1 },
      token: 'abc',
      isAuthenticated: false,
      _persist: { version: 2, rehydrated: true },
    };
    const res = await authPersistConfig.migrate(incoming);
    const result = res as {
      isAuthenticated?: boolean;
      _persist?: { version: number; rehydrated: boolean };
    };
    expect(result.isAuthenticated).toBe(true);
    expect(result._persist).toEqual({ version: 2, rehydrated: true });
  });

  it('should handle exceptions and return safe default', async () => {
    (localStorageService.get as jest.Mock).mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const res = await authPersistConfig.migrate({ _persist: { version: 2, rehydrated: true } });
    expect(res).toEqual({
      user: null,
      token: null,
      isAuthenticated: false,
      _persist: { version: 2, rehydrated: true },
    });
  });
});
