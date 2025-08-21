import {
  API_ROUTES,
  getAuthVerifyEmailUrl,
  getAuthResetPasswordUrl,
  getUserByIdUrl,
  getUpdateUserByIdUrl,
  getDeleteUserByIdUrl,
  getUserAvailabilityUrl,
  getUserGamesUrl,
  getUserProfileUrl,
} from '@shared/constants/apiRoutes';
import {
  PUBLIC_ROUTES,
  PRIVATE_ROUTES,
  APP_ROUTES,
  getPrivateRoutesRelative,
  getResetPasswordUrl,
  getVerifyEmailUrl,
} from '@shared/constants/appRoutes';

describe('apiRoutes helpers', () => {
  it.each([
    ['/api/auth/verify-email/token123', getAuthVerifyEmailUrl, 'token123'],
    ['/api/auth/reset-password/abc', getAuthResetPasswordUrl, 'abc'],
  ])('should build auth route %s', (expected, fn, arg) => {
    expect(fn(arg as string)).toBe(expected);
  });

  it.each([
    ['/api/users/1', getUserByIdUrl, '1'],
    ['/api/users/2', getUpdateUserByIdUrl, '2'],
    ['/api/users/3', getDeleteUserByIdUrl, '3'],
  ])('should build user route %s', (expected, fn, id) => {
    expect(fn(id as string)).toBe(expected);
  });

  it('should have constants defined', () => {
    expect(API_ROUTES.AUTH.LOGIN).toBe('/auth/login');
    expect(API_ROUTES.USERS.GET_ALL).toBe('/users');
  });

  // preferences (merged)
  it('should build preferences routes with id parameter', () => {
    expect(getUserProfileUrl('7')).toBe('/api/profiles/7');
    expect(getUserAvailabilityUrl('7')).toBe('/api/profiles/7/availability');
    expect(getUserGamesUrl('7')).toBe('/api/profiles/7/games');
  });

  it('should url-encode ids properly', () => {
    expect(getUserProfileUrl('A B')).toBe('/api/profiles/A%20B');
  });
});

// Unified from appRoutes.unit.extra.test.ts
describe('appRoutes helpers and constants (unified)', () => {
  it('PUBLIC_ROUTES should contain expected keys', () => {
    expect(PUBLIC_ROUTES.HOME).toBe('/');
    expect(PUBLIC_ROUTES.LOGIN).toBe('/login');
    expect(PUBLIC_ROUTES.RESET_PASSWORD).toContain(':token');
  });

  it('PRIVATE_ROUTES should include /app prefix and be merged into APP_ROUTES', () => {
    Object.values(PRIVATE_ROUTES).forEach(route => {
      expect(route.startsWith('/app/')).toBe(true);
    });
    expect(APP_ROUTES.DASHBOARD).toBe(PRIVATE_ROUTES.DASHBOARD);
  });

  it('getPrivateRoutesRelative should strip the /app/ prefix', () => {
    const relative = getPrivateRoutesRelative();
    expect(relative.DASHBOARD).toBe('dashboard');
    expect(relative.TEAMS_CREATE).toBe('teams/create');
  });

  it('getResetPasswordUrl should replace token and encode', () => {
    const url = getResetPasswordUrl('a/b?c');
    expect(url).toBe('/reset-password/a%2Fb%3Fc');
  });

  it('getVerifyEmailUrl should replace token and encode', () => {
    const url = getVerifyEmailUrl('x y');
    expect(url).toBe('/verify-email/x%20y');
  });
});

// Unified from appRoutes.branch.test.ts
describe('appRoutes getPrivateRoutesRelative else branch (unified)', () => {
  it('returns value unchanged when route does not start with /app/', async () => {
    await jest.isolateModulesAsync(async () => {
      const mod = require('@shared/constants/appRoutes');
      const target = mod.PRIVATE_ROUTES;
      const originalEntries = Object.entries;
      const spy = jest
        .spyOn(Object, 'entries')
        .mockImplementation((obj: Record<string, string>): Array<[string, string]> => {
          const res = originalEntries(obj) as Array<[string, string]>;
          if (obj === target) {
            return [...res, ['TEST_NO_PREFIX', '/noapp/path']];
          }
          return res as Array<[string, string]>;
        });

      const relative = mod.getPrivateRoutesRelative();
      expect(relative.TEST_NO_PREFIX).toBe('/noapp/path');
      spy.mockRestore();
    });
  });
});
