import { configureStore } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';

import { loginAction, logoutAction, registerAction } from '@application/state/actions/auth.actions';
import authReducer, { initialAuthState } from '@application/state/slices/authSlice';
import { UserRole } from '@domain/constants/user';
import { useAuth } from '@ui/hooks/useAuth';

function createTestStore(preloadedAuthState = initialAuthState) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: preloadedAuthState },
  });
}

function getWrapper(store: ReturnType<typeof createTestStore>) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  Wrapper.displayName = 'ReduxTestWrapper';
  return Wrapper;
}

describe('useAuth Hook (Redux integration)', () => {
  it('debe exponer el estado inicial no autenticado', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('debe despachar login y actualizar el estado', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

    // Simula login exitoso
    const fakeUser = {
      id: '1',
      email: 'a@b.com',
      username: 'test',
      role: 'user' as UserRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await store.dispatch(
      loginAction.fulfilled({ data: fakeUser, success: true }, '', {
        email: 'a@b.com',
        password: '123456',
      })
    );

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(fakeUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('debe despachar register y actualizar el estado', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

    const fakeUser = {
      id: '2',
      email: 'c@d.com',
      username: 'newuser',
      role: 'user' as UserRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await act(async () => {
      await store.dispatch(
        registerAction.fulfilled({ data: fakeUser, success: true }, '', {
          email: 'c@d.com',
          password: 'abc123',
          username: 'newuser',
        })
      );
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(fakeUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('debe despachar logout y limpiar el estado', async () => {
    // Estado inicial autenticado
    const fakeUser = {
      id: '1',
      email: 'a@b.com',
      username: 'test',
      role: 'user' as UserRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const store = createTestStore({
      ...initialAuthState,
      isAuthenticated: true,
      user: fakeUser,
    });
    const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

    await act(async () => {
      await store.dispatch(logoutAction.fulfilled({ success: true }, 'logout-request-id'));
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('debe exponer el error si el slice lo establece', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

    // Simula error en login
    await act(async () => {
      await store.dispatch(
        loginAction.rejected(
          new Error('Credenciales inválidas'),
          '',
          { email: 'fail@fail.com', password: 'bad' },
          { message: 'Credenciales inválidas' }
        )
      );
    });

    expect(result.current.error).toBe('Credenciales inválidas');
    expect(result.current.isAuthenticated).toBe(false);
  });
});
