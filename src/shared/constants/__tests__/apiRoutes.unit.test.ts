import {
  API_ROUTES,
  getAuthVerifyEmailUrl,
  getAuthResetPasswordUrl,
  getUserByIdUrl,
  getUpdateUserByIdUrl,
  getDeleteUserByIdUrl,
} from '@shared/constants/apiRoutes';

describe('apiRoutes helpers', () => {
  it.each([
    ['/auth/verify-email/token123', getAuthVerifyEmailUrl, 'token123'],
    ['/auth/reset-password/abc', getAuthResetPasswordUrl, 'abc'],
  ])('should build auth route %s', (expected, fn, arg) => {
    expect(fn(arg as string)).toBe(expected);
  });

  it.each([
    ['/users/1', getUserByIdUrl],
    ['/users/2', getUpdateUserByIdUrl],
    ['/users/3', getDeleteUserByIdUrl],
  ])('should build user route %s', (expected, fn) => {
    const id = expected.split('/')[2];
    expect(fn(id)).toBe(expected);
  });

  it('should have constants defined', () => {
    expect(API_ROUTES.AUTH.LOGIN).toBe('/auth/login');
    expect(API_ROUTES.USERS.GET_ALL).toBe('/users');
  });
});
