import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { useAppDispatch, useAppSelector } from '@application/state/hooks';
import { USER_ROLES } from '@domain/constants/user';
import type { RootState } from '@domain/types/redux';
import { useAuth } from '@ui/hooks/useAuth';

// 1. Mocks de dispatch y selector
jest.mock('@application/state/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

// 2. Helper para envolver el hook con un store mínimo
const createWrapper = () => {
  const store = configureStore({ reducer: (state: unknown) => state as RootState });
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, Wrapper };
};

/**
 * Genera un resultado de dispatch simulado (fulfilled o rejected)
 */
const makeAction = <T,>(type: string, payload: T) => ({ type, payload });

describe('useAuth (refactor)', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useAppSelector as unknown as jest.Mock).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    } as RootState['auth']);
  });

  it.each([
    ['login', 'auth/login', { email: 'e@mail.com', password: '123' }],
    ['register', 'auth/register', { email: 'e@mail.com', password: '123', username: 'u' }],
    ['forgotPassword', 'auth/forgotPassword', { email: 'e@mail.com' }],
    ['resetPassword', 'auth/resetPassword', { token: 'tok', password: '123' }],
    ['resendVerification', 'auth/resendVerification', { identifier: 'e@mail.com' }],
  ])('should dispatch %s and return fulfilled action', async (method, typeBase, payload) => {
    const fulfilledAction = makeAction(`${typeBase}/fulfilled`, 'any-payload');
    // Mock dispatch to return a promise that resolves to the action
    mockDispatch.mockReturnValueOnce(Promise.resolve(fulfilledAction));

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    // @ts-ignore - Dynamic method access in test
    const response = await result.current[method](payload);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.any(Function) // The thunk action creator is a function
    );
    expect(response).toEqual(fulfilledAction);
  });

  it('should dispatch logout action', async () => {
    const logoutAction = makeAction('auth/logout/fulfilled', undefined);
    // Mock dispatch to return a promise that resolves to the action
    mockDispatch.mockReturnValueOnce(Promise.resolve(logoutAction));

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    const response = await result.current.logout();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.any(Function) // The thunk action creator is a function
    );
    expect(response).toEqual(logoutAction);
  });

  it('should return user, token, isAuthenticated, and loading from state', () => {
    const authState = {
      user: { id: '1', email: 'user@example.com', username: 'user', role: 'user' },
      token: 'token-123',
      isAuthenticated: true,
      loading: false,
    };
    (useAppSelector as unknown as jest.Mock).mockReturnValue(authState);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    expect(result.current.user).toEqual(authState.user);
    expect(result.current.token).toEqual(authState.token);
    expect(result.current.isAuthenticated).toBe(authState.isAuthenticated);
    expect(result.current.loading).toBe(authState.loading);
  });

  describe('Error handling', () => {
    it.each([
      ['AUTH_LOGIN_ERROR', 'E_LOGIN_001'],
      ['AUTH_REGISTER_ERROR', 'E_REGISTER_001'],
      ['AUTH_FORGOT_PASSWORD_ERROR', 'E_FORGOT_PASSWORD_001'],
      ['AUTH_RESET_PASSWORD_ERROR', 'E_RESET_PASSWORD_001'],
      ['AUTH_RESEND_VERIFICATION_ERROR', 'E_RESEND_VERIFICATION_001'],
    ])('should handle %s error', async (_errorType, code) => {
      const rejectedAction = makeAction(`auth/login/rejected`, {
        error: { code },
      });
      mockDispatch.mockResolvedValueOnce(rejectedAction);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      const response = await result.current.login({
        email: 'test@example.com',
        password: 'password',
      });
      expect(mockDispatch).toHaveBeenCalled();
      expect(response).toEqual(rejectedAction);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the required role', () => {
      (useAppSelector as unknown as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'admin@example.com', username: 'admin', role: 'admin' },
        token: 'token-123',
        isAuthenticated: true,
        loading: false,
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      expect(result.current.hasRole(USER_ROLES.ADMIN)).toBe(true);
    });

    it('should return true when user has one of the required roles', () => {
      (useAppSelector as unknown as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'manager@example.com', username: 'manager', role: 'manager' },
        token: 'token-123',
        isAuthenticated: true,
        loading: false,
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      expect(result.current.hasRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER])).toBe(true);
    });

    it('should return false when user does not have the required role', () => {
      (useAppSelector as unknown as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'user@example.com', username: 'user', role: 'user' },
        token: 'token-123',
        isAuthenticated: true,
        loading: false,
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      expect(result.current.hasRole(USER_ROLES.ADMIN)).toBe(false);
    });

    it('should return false when user does not have any of the required roles', () => {
      (useAppSelector as unknown as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'user@example.com', username: 'user', role: 'user' },
        token: 'token-123',
        isAuthenticated: true,
        loading: false,
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      expect(result.current.hasRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER])).toBe(false);
    });

    it('should return false when user is null', () => {
      (useAppSelector as unknown as jest.Mock).mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      expect(result.current.hasRole(USER_ROLES.ADMIN)).toBe(false);
    });

    it('should return false when user has no role', () => {
      (useAppSelector as unknown as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'user@example.com', username: 'user' },
        token: 'token-123',
        isAuthenticated: true,
        loading: false,
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      expect(result.current.hasRole(USER_ROLES.ADMIN)).toBe(false);
    });
  });
});
