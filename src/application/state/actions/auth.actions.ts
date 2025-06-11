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
  async (payload: LoginPayload, { extra }) => {
    const { loginUseCase } = extra as { loginUseCase: LoginUseCase };
    return await loginUseCase.execute(payload);
  }
);

export const registerAction = createAsyncThunk(
  API_ROUTES.AUTH.REGISTER,
  async (payload: RegisterPayload, { extra }) => {
    const { registerUseCase } = extra as { registerUseCase: RegisterUseCase };
    return await registerUseCase.execute(payload);
  }
);

export const forgotPasswordAction = createAsyncThunk(
  API_ROUTES.AUTH.FORGOT_PASSWORD,
  async (payload: ForgotPasswordPayload, { extra }) => {
    const { forgotPasswordUseCase } = extra as { forgotPasswordUseCase: ForgotPasswordUseCase };
    return await forgotPasswordUseCase.execute(payload);
  }
);

export const resetPasswordAction = createAsyncThunk(
  API_ROUTES.AUTH.RESET_PASSWORD,
  async (payload: ResetPasswordPayload, { extra }) => {
    const { resetPasswordUseCase } = extra as { resetPasswordUseCase: ResetPasswordUseCase };
    return await resetPasswordUseCase.execute(payload);
  }
);

export const logoutAction = createAsyncThunk(API_ROUTES.AUTH.LOGOUT, async (_, { extra }) => {
  const { logoutUseCase } = extra as { logoutUseCase: LogoutUseCase };
  return await logoutUseCase.execute();
});

export const resendVerificationAction = createAsyncThunk(
  API_ROUTES.AUTH.VERIFY_EMAIL_RESEND,
  async (payload: ResendVerificationPayload, { extra }) => {
    const { resendVerificationUseCase } = extra as {
      resendVerificationUseCase: ResendVerificationUseCase;
    };
    return await resendVerificationUseCase.execute(payload);
  }
);
