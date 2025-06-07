import { configureStore } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';

import {
  loginAction,
  logoutAction,
  registerAction,
  forgotPasswordAction,
  resetPasswordAction,
} from '@application/state/actions/auth.actions';
import authReducer from '@application/state/slices/authSlice';
import { UserRole } from '@domain/constants/user';
import { User } from '@domain/entities/User';
import { AuthState } from '@domain/types/auth';
import { useAuth } from '@ui/hooks/useAuth';

// Mock de los casos de uso
const mockForgotPasswordUseCase = {
  execute: jest.fn().mockResolvedValue({ success: true }),
};

const mockResetPasswordUseCase = {
  execute: jest.fn().mockResolvedValue({ success: true }),
};

function getWrapper(store: ReturnType<typeof configureStore<{ auth: AuthState }>>) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  Wrapper.displayName = 'ReduxTestWrapper';
  return Wrapper;
}

describe('useAuth', () => {
  let store: ReturnType<typeof configureStore<{ auth: AuthState }>>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
      middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: false,
          thunk: {
            extraArgument: {
              forgotPasswordUseCase: mockForgotPasswordUseCase,
              resetPasswordUseCase: mockResetPasswordUseCase,
            },
          },
        }),
    });
  });

  it('should handle login success', async () => {
    const fakeUser: User = {
      id: '1',
      email: 'a@b.com',
      username: 'test',
      role: 'user' as UserRole,
      createdAt: new Date('2025-06-07T13:38:18.507Z'),
      updatedAt: new Date('2025-06-07T13:38:18.507Z'),
    };

    await act(async () => {
      await store.dispatch(
        loginAction.fulfilled({ data: fakeUser, success: true }, '', {
          email: 'a@b.com',
          password: '123456',
        })
      );
    });

    const state = store.getState();
    expect(state.auth.user).toEqual(fakeUser);
    expect(state.auth.isAuthenticated).toBe(true);
  });

  it('should handle register success', async () => {
    const fakeUser: User = {
      id: '2',
      email: 'c@d.com',
      username: 'newuser',
      role: 'user' as UserRole,
      createdAt: new Date('2025-06-07T13:38:18.727Z'),
      updatedAt: new Date('2025-06-07T13:38:18.727Z'),
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

    const state = store.getState();
    expect(state.auth.user).toEqual(fakeUser);
    expect(state.auth.isAuthenticated).toBe(true);
  });

  it('debe exponer el estado inicial no autenticado', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('debe despachar logout y limpiar el estado', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

    await act(async () => {
      store.dispatch(logoutAction.fulfilled({ success: true }, 'logout-request-id'));
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('debe exponer el error si el slice lo establece', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

    await act(async () => {
      store.dispatch(
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
