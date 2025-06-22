import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { useAppDispatch, useAppSelector } from '@application/state/hooks';
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
    const fulfilledAction = makeAction(`${typeBase}/fulfilled`, { ok: true });
    mockDispatch.mockResolvedValueOnce(fulfilledAction);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    // @ts-expect-error dynamic call
    const response = await result.current[method](payload);

    expect(mockDispatch).toHaveBeenCalled();
    expect(response).toEqual(fulfilledAction);
  });

  it.each([
    ['login', 'auth/login', { email: 'bad', password: 'bad' }],
    ['register', 'auth/register', { email: 'bad', password: 'x', username: 'u' }],
  ])('should dispatch %s and return rejected action', async (method, typeBase, payload) => {
    const rejectedAction = makeAction(`${typeBase}/rejected`, { error: 'fail' });
    mockDispatch.mockResolvedValueOnce(rejectedAction);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    // @ts-expect-error dynamic call
    const response = await result.current[method](payload);

    expect(mockDispatch).toHaveBeenCalled();
    expect(response).toEqual(rejectedAction);
  });

  it('logout should dispatch and return fulfilled action', async () => {
    const action = makeAction('auth/logout/fulfilled', { ok: true });
    mockDispatch.mockResolvedValueOnce(action);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    const response = await result.current.logout();
    expect(mockDispatch).toHaveBeenCalled();
    expect(response).toEqual(action);
  });
});
