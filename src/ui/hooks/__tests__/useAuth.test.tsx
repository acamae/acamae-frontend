import { configureStore, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

import { useAppDispatch, useAppSelector } from '@application/state/hooks';
import authReducer from '@application/state/slices/authSlice';
import { UserRole } from '@domain/constants/user';
import { User } from '@domain/entities/User';
import {
  ApiError,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ResendVerificationPayload,
  ApiSuccessResponse,
} from '@domain/types/apiSchema';
import { AuthState } from '@domain/types/auth';
import { useAuth } from '@ui/hooks/useAuth';

// Mock useAppDispatch
jest.mock('@application/state/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

// Mock authSlice reducer
jest.mock('@application/state/slices/authSlice', () => ({
  __esModule: true,
  default: (
    state = { loading: false, user: null, token: null, isAuthenticated: false, expiresAt: null },
    action: PayloadAction<{ data: User; token: string }>
  ) => {
    switch (action.type) {
      case 'auth/login/fulfilled':
      case 'auth/register/fulfilled':
        return {
          ...state,
          loading: false,
          user: action.payload.data,
          token: action.payload.token,
          isAuthenticated: true,
        };
      case 'auth/login/rejected':
      case 'auth/register/rejected':
      case 'auth/logout/fulfilled':
        return {
          ...state,
          loading: false,
          user: null,
          token: null,
          isAuthenticated: false,
        };
      default:
        return state;
    }
  },
}));

// Mock Redux Toolkit actions
jest.mock('@application/state/actions/auth.actions', () => ({
  loginAction: createAsyncThunk('auth/login', mockLoginThunk),
  registerAction: createAsyncThunk('auth/register', mockRegisterThunk),
  logoutAction: createAsyncThunk('auth/logout', mockLogoutThunk),
  forgotPasswordAction: createAsyncThunk('auth/forgotPassword', mockForgotPasswordThunk),
  resetPasswordAction: createAsyncThunk('auth/resetPassword', mockResetPasswordThunk),
  resendVerificationAction: createAsyncThunk(
    'auth/resendVerification',
    mockResendVerificationThunk
  ),
}));

async function mockLoginThunk(payload: LoginPayload) {
  if (payload.email === 'test@example.com' && payload.password === 'password123') {
    return {
      success: true,
      data: {
        user: { id: '1', email: 'test@example.com', role: 'user' },
        token: 'test-token',
      },
      message: 'Login successful',
      status: 200,
      code: 'SUCCESS',
    } as const;
  }
  return {
    success: false,
    message: 'Invalid credentials',
    status: 401,
    code: 'UNAUTHORIZED',
  } as const;
}

async function mockRegisterThunk(payload: RegisterPayload) {
  if (payload.email === 'test@example.com') {
    return {
      success: true,
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          username: payload.username,
          role: 'user',
        },
        token: 'test-token',
      },
      message: 'Registration successful',
      status: 200,
      code: 'SUCCESS',
    } as const;
  }
  return {
    success: false,
    message: 'Email already exists',
    status: 409,
    code: 'CONFLICT',
  } as const;
}

async function mockForgotPasswordThunk(payload: ForgotPasswordPayload) {
  if (payload.email === 'test@example.com') {
    return {
      success: true,
      data: null,
      message: 'Password reset email sent',
      status: 200,
      code: 'SUCCESS',
    } as const;
  }
  return {
    success: false,
    message: 'User not found',
    status: 404,
    code: 'NOT_FOUND',
  } as const;
}

async function mockResetPasswordThunk(payload: ResetPasswordPayload) {
  if (payload.token === 'reset-token') {
    return {
      success: true,
      data: null,
      message: 'Password reset successful',
      status: 200,
      code: 'SUCCESS',
    } as const;
  }
  return {
    success: false,
    message: 'Invalid or expired token',
    status: 400,
    code: 'BAD_REQUEST',
  } as const;
}

async function mockResendVerificationThunk(payload: ResendVerificationPayload) {
  if (payload.identifier === 'test@example.com') {
    return {
      success: true,
      data: null,
      message: 'Verification email sent',
      status: 200,
      code: 'SUCCESS',
    } as const;
  }
  return {
    success: false,
    message: 'User already verified',
    status: 400,
    code: 'BAD_REQUEST',
  } as const;
}

async function mockLogoutThunk() {
  return {
    success: true,
    data: null,
    message: 'Logout successful',
    status: 200,
    code: 'SUCCESS',
  } as const;
}

function getWrapper(store: ReturnType<typeof configureStore<{ auth: AuthState }>>) {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
}

describe('useAuth', () => {
  let store: ReturnType<typeof configureStore<{ auth: AuthState }>>;
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
      middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    });
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useAppSelector as unknown as jest.Mock).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    });
  });

  describe('login', () => {
    it('should handle successful login', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

      const loginPayload = { email: 'test@example.com', password: 'password123' };
      const successResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            role: 'user' as UserRole,
          } as User,
          token: 'test-token',
        },
        message: 'Login successful',
        status: 200,
        code: 'SUCCESS',
      };

      // Mock login action
      const loginAction = {
        type: 'auth/login/fulfilled',
        payload: {
          data: successResponse.data.user,
          token: successResponse.data.token,
        },
      };

      const dispatchResult = {
        ...loginAction,
        unwrap: () => Promise.resolve(successResponse),
      };

      mockDispatch.mockImplementationOnce(() => dispatchResult);

      const response = await result.current.login(loginPayload);

      // Verify dispatch was called
      expect(mockDispatch).toHaveBeenCalled();

      // Verify response is the expected one
      expect(response).toEqual(successResponse.data);

      // Process action in reducer
      store.dispatch(loginAction);

      // Verify state was updated correctly
      expect(store.getState().auth).toEqual({
        user: successResponse.data.user,
        token: successResponse.data.token,
        isAuthenticated: true,
        loading: false,
        expiresAt: null,
      });
    });

    it('should handle login error', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

      const loginPayload = { email: 'test@example.com', password: 'wrong-password' };
      const errorResponse = {
        success: false,
        message: 'Invalid credentials',
        status: 401,
        code: 'UNAUTHORIZED',
      };

      const dispatchResult = {
        type: 'auth/login/rejected',
        payload: errorResponse,
        unwrap: () => Promise.resolve(errorResponse),
      };

      mockDispatch.mockImplementationOnce(() => dispatchResult);

      await expect(result.current.login(loginPayload)).rejects.toThrow(ApiError);
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should handle successful registration', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

      const registerPayload = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };
      const successResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            role: 'user' as UserRole,
          } as User,
          token: 'test-token',
        },
        message: 'Registration successful',
        status: 200,
        code: 'SUCCESS',
      };

      const registerAction = {
        type: 'auth/register/fulfilled',
        payload: {
          data: successResponse.data.user,
          token: successResponse.data.token,
        },
      };

      const dispatchResult = {
        ...registerAction,
        unwrap: () => Promise.resolve(successResponse),
      };

      mockDispatch.mockImplementationOnce(() => dispatchResult);

      const response = await result.current.register(registerPayload);

      expect(mockDispatch).toHaveBeenCalled();
      expect(response).toEqual(successResponse.data);

      store.dispatch(registerAction);

      expect(store.getState().auth).toEqual({
        user: successResponse.data.user,
        token: successResponse.data.token,
        isAuthenticated: true,
        loading: false,
        expiresAt: null,
      });
    });

    it('should handle registration error', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

      const registerPayload = {
        email: 'existing@example.com',
        password: 'password123',
        username: 'testuser',
      };
      const errorResponse = {
        success: false,
        message: 'Email already exists',
        status: 409,
        code: 'CONFLICT',
      };

      const dispatchResult = {
        type: 'auth/register/rejected',
        payload: errorResponse,
        unwrap: () => Promise.resolve(errorResponse),
      };

      mockDispatch.mockImplementationOnce(() => dispatchResult);

      await expect(result.current.register(registerPayload)).rejects.toThrow(ApiError);
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should handle successful logout', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

      const successResponse = {
        success: true,
        data: null,
        message: 'Logout successful',
        status: 200,
        code: 'SUCCESS',
      };

      const logoutAction = {
        type: 'auth/logout/fulfilled',
        payload: successResponse,
      };

      const dispatchResult = {
        ...logoutAction,
        unwrap: () => Promise.resolve(successResponse),
      };

      mockDispatch.mockImplementationOnce(() => dispatchResult);

      const response = await result.current.logout();

      expect(mockDispatch).toHaveBeenCalled();
      expect(response).toEqual(successResponse.data);

      store.dispatch(logoutAction);

      expect(store.getState().auth).toEqual({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        expiresAt: null,
      });
    });

    it('should handle logout error', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

      const errorResponse = {
        success: false,
        message: 'Logout failed',
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
      };

      const dispatchResult = {
        type: 'auth/logout/rejected',
        payload: errorResponse,
        unwrap: () => Promise.resolve(errorResponse),
      };

      mockDispatch.mockImplementationOnce(() => dispatchResult);

      await expect(result.current.logout()).rejects.toThrow(ApiError);
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should handle successful forgot password request', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

      const forgotPasswordPayload = { email: 'test@example.com' };
      const successResponse = {
        success: true,
        data: null,
        message: 'Password reset email sent',
        status: 200,
        code: 'SUCCESS',
      };

      const forgotPasswordAction = {
        type: 'auth/forgotPassword/fulfilled',
        payload: successResponse,
      };

      const dispatchResult = {
        ...forgotPasswordAction,
        unwrap: () => Promise.resolve(successResponse),
      };

      mockDispatch.mockImplementationOnce(() => dispatchResult);

      const response = await result.current.forgotPassword(forgotPasswordPayload);

      expect(mockDispatch).toHaveBeenCalled();
      expect(response).toEqual(successResponse.data);
    });

    it('should handle forgot password error', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

      const forgotPasswordPayload = { email: 'nonexistent@example.com' };
      const errorResponse = {
        success: false,
        message: 'User not found',
        status: 404,
        code: 'NOT_FOUND',
      };

      const dispatchResult = {
        type: 'auth/forgotPassword/rejected',
        payload: errorResponse,
        unwrap: () => Promise.resolve(errorResponse),
      };

      mockDispatch.mockImplementationOnce(() => dispatchResult);

      await expect(result.current.forgotPassword(forgotPasswordPayload)).rejects.toThrow(ApiError);
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should handle successful password reset', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

      const resetPasswordPayload = {
        token: 'reset-token',
        password: 'newpassword123',
      };
      const successResponse = {
        success: true,
        data: null,
        message: 'Password reset successful',
        status: 200,
        code: 'SUCCESS',
      };

      const resetPasswordAction = {
        type: 'auth/resetPassword/fulfilled',
        payload: successResponse,
      };

      const dispatchResult = {
        ...resetPasswordAction,
        unwrap: () => Promise.resolve(successResponse),
      };

      mockDispatch.mockImplementationOnce(() => dispatchResult);

      const response = await result.current.resetPassword(resetPasswordPayload);

      expect(mockDispatch).toHaveBeenCalled();
      expect(response).toEqual(successResponse.data);
    });

    it('should handle reset password error', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

      const resetPasswordPayload: ResetPasswordPayload = {
        token: 'invalid-token',
        password: 'newpassword123',
      };
      const errorResponse = {
        success: false,
        message: 'Invalid or expired token',
        status: 400,
        code: 'BAD_REQUEST',
      };

      const dispatchResult = {
        type: 'auth/resetPassword/rejected',
        payload: errorResponse,
        unwrap: () => Promise.resolve(errorResponse),
      };

      mockDispatch.mockImplementationOnce(() => dispatchResult);

      await expect(result.current.resetPassword(resetPasswordPayload)).rejects.toThrow(ApiError);
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('resendVerification', () => {
    it('should handle successful verification resend', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

      const resendVerificationPayload: ResendVerificationPayload = {
        identifier: 'test@example.com',
      };
      const successResponse: ApiSuccessResponse<null> = {
        success: true,
        data: null,
        message: 'Verification email sent',
        status: 200,
        code: 'SUCCESS',
      };

      const resendVerificationAction = {
        type: 'auth/resendVerification/fulfilled',
        payload: successResponse,
      };

      const dispatchResult = {
        ...resendVerificationAction,
        unwrap: () => Promise.resolve(successResponse),
      };

      mockDispatch.mockImplementationOnce(() => dispatchResult);

      const response = await result.current.resendVerification(resendVerificationPayload);

      expect(mockDispatch).toHaveBeenCalled();
      expect(response).toEqual(successResponse.data);
    });

    it('should handle resend verification error', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: getWrapper(store) });

      const resendVerificationPayload = { identifier: 'verified@example.com' };
      const errorResponse = {
        success: false,
        message: 'User already verified',
        status: 400,
        code: 'BAD_REQUEST',
      };

      const dispatchResult = {
        type: 'auth/resendVerification/rejected',
        payload: errorResponse,
        unwrap: () => Promise.resolve(errorResponse),
      };

      mockDispatch.mockImplementationOnce(() => dispatchResult);

      await expect(result.current.resendVerification(resendVerificationPayload)).rejects.toThrow(
        ApiError
      );
      expect(mockDispatch).toHaveBeenCalled();
    });
  });
});
