import { createAsyncThunk } from '@reduxjs/toolkit';

import { ForgotPasswordUseCase } from '@application/use-cases/auth/ForgotPasswordUseCase';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { LogoutUseCase } from '@application/use-cases/auth/LogoutUseCase';
import { RegisterUseCase } from '@application/use-cases/auth/RegisterUseCase';
import { ResendVerificationUseCase } from '@application/use-cases/auth/ResendVerificationUseCase';
import { ResetPasswordUseCase } from '@application/use-cases/auth/ResetPasswordUseCase';
import {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  ResendVerificationPayload,
} from '@domain/types/apiSchema';
import { API_ROUTES } from '@shared/constants/apiRoutes';

// Async thunks using use cases
export const loginAction = createAsyncThunk(
  API_ROUTES.AUTH.LOGIN,
  async (payload: LoginPayload, { extra, rejectWithValue }) => {
    const { loginUseCase } = extra as { loginUseCase: LoginUseCase };
    try {
      const result = await loginUseCase.execute(payload);

      if (!result.success) {
        return rejectWithValue(result);
      }

      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const registerAction = createAsyncThunk(
  API_ROUTES.AUTH.REGISTER,
  async (payload: RegisterPayload, { extra, rejectWithValue }) => {
    const { registerUseCase } = extra as { registerUseCase: RegisterUseCase };
    try {
      const result = await registerUseCase.execute(payload);

      if (!result.success) {
        return rejectWithValue(result);
      }

      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const forgotPasswordAction = createAsyncThunk(
  API_ROUTES.AUTH.FORGOT_PASSWORD,
  async (payload: ForgotPasswordPayload, { extra, rejectWithValue }) => {
    const { forgotPasswordUseCase } = extra as { forgotPasswordUseCase: ForgotPasswordUseCase };
    try {
      const result = await forgotPasswordUseCase.execute(payload);

      if (!result.success) {
        return rejectWithValue(result);
      }

      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const resetPasswordAction = createAsyncThunk(
  API_ROUTES.AUTH.RESET_PASSWORD,
  async (payload: ResetPasswordPayload, { extra, rejectWithValue }) => {
    const { resetPasswordUseCase } = extra as { resetPasswordUseCase: ResetPasswordUseCase };
    try {
      const result = await resetPasswordUseCase.execute(payload);

      if (!result.success) {
        return rejectWithValue(result);
      }

      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const logoutAction = createAsyncThunk(
  API_ROUTES.AUTH.LOGOUT,
  async (_, { extra, rejectWithValue }) => {
    const { logoutUseCase } = extra as { logoutUseCase: LogoutUseCase };
    try {
      const result = await logoutUseCase.execute();

      if (!result.success) {
        return rejectWithValue(result);
      }

      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const resendVerificationAction = createAsyncThunk(
  API_ROUTES.AUTH.VERIFY_EMAIL_RESEND,
  async (payload: ResendVerificationPayload, { extra, rejectWithValue }) => {
    const { resendVerificationUseCase } = extra as {
      resendVerificationUseCase: ResendVerificationUseCase;
    };
    try {
      const result = await resendVerificationUseCase.execute(payload);

      if (!result.success) {
        return rejectWithValue(result);
      }

      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
