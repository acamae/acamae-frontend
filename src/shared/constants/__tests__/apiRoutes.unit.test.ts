import {
  API_ROUTES,
  getAuthVerifyEmailUrl,
  getAuthResetPasswordUrl,
  getUserByIdUrl,
  getUpdateUserByIdUrl,
  getDeleteUserByIdUrl,
  getUserPublicProfileUrl,
  getUserAvailabilityUrl,
  getUserGamesUrl,
} from '@shared/constants/apiRoutes';

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
    expect(getUserPublicProfileUrl('7')).toBe('/api/users/7/public');
    expect(getUserAvailabilityUrl('7')).toBe('/api/users/7/availability');
    expect(getUserGamesUrl('7')).toBe('/api/users/7/games');
  });

  it('should url-encode ids properly', () => {
    expect(getUserPublicProfileUrl('A B')).toBe('/api/users/A%20B/public');
  });
});
