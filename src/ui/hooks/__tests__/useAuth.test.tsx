import { configureStore } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';

import { loginAction, logoutAction, registerAction, forgotPasswordAction, resetPasswordAction } from '@application/state/actions/auth.actions';
import authReducer, { initialAuthState } from '@application/state/slices/authSlice';
import { UserRole } from '@domain/constants/user';
import { useAuth } from '@ui/hooks/useAuth';

// Mock de los casos de uso
const mockForgotPasswordUseCase = {
  execute: jest.fn().mockResolvedValue({ success: true }),
};

const mockResetPasswordUseCase = {
  execute: jest.fn().mockResolvedValue({ success: true }),
};

function createTestStore(preloadedAuthState = initialAuthState) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: preloadedAuthState },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            forgotPasswordUseCase: mockForgotPasswordUseCase,
            resetPasswordUseCase: mockResetPasswordUseCase,
          },
        },
      }),
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

  it('debe despachar forgotPassword y actualizar el estado', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

    await act(async () => {
      await store.dispatch(
        forgotPasswordAction.fulfilled({ success: true }, '', { email: 'test@example.com' })
      );
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('debe despachar resetPassword y actualizar el estado', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

    await act(async () => {
      await store.dispatch(
        resetPasswordAction.fulfilled({ success: true }, '', {
          token: 'reset-token',
          newPassword: 'new-password',
        })
      );
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('debe manejar error en forgotPassword', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

    await act(async () => {
      await store.dispatch(
        forgotPasswordAction.rejected(
          new Error('Error al enviar correo'),
          '',
          { email: 'test@example.com' },
          { message: 'Error al enviar correo' }
        )
      );
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Error al enviar correo');
  });

  it('debe manejar error en resetPassword', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

    await act(async () => {
      await store.dispatch(
        resetPasswordAction.rejected(
          new Error('Error al restablecer contraseña'),
          '',
          { token: 'reset-token', newPassword: 'new-password' },
          { message: 'Error al restablecer contraseña' }
        )
      );
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Error al restablecer contraseña');
  });

  it('debe llamar a forgotPassword con los parámetros correctos', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

    const email = 'test@example.com';
    await act(async () => {
      await result.current.forgotPassword({ email });
    });

    expect(mockForgotPasswordUseCase.execute).toHaveBeenCalledWith({ email });
    expect(store.getState().auth.loading).toBe(false);
    expect(store.getState().auth.error).toBeNull();
  });

  it('debe llamar a resetPassword con los parámetros correctos', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

    const payload = {
      token: 'reset-token',
      newPassword: 'new-password',
    };
    await act(async () => {
      await result.current.resetPassword(payload);
    });

    expect(mockResetPasswordUseCase.execute).toHaveBeenCalledWith(payload);
    expect(store.getState().auth.loading).toBe(false);
    expect(store.getState().auth.error).toBeNull();
  });
});
