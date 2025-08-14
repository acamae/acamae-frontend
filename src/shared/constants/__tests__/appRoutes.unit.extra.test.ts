import {
  PUBLIC_ROUTES,
  PRIVATE_ROUTES,
  APP_ROUTES,
  getPrivateRoutesRelative,
  getResetPasswordUrl,
  getVerifyEmailUrl,
} from '@shared/constants/appRoutes';

describe('appRoutes helpers and constants', () => {
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
