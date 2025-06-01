import { createAsyncThunk } from '@reduxjs/toolkit';

import { ForgotPasswordUseCase } from '@application/use-cases/auth/ForgotPasswordUseCase';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { LogoutUseCase } from '@application/use-cases/auth/LogoutUseCase';
import { RegisterUseCase } from '@application/use-cases/auth/RegisterUseCase';
import { ResetPasswordUseCase } from '@application/use-cases/auth/ResetPasswordUseCase';
import {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from '@domain/types/apiSchema';

// Async thunks using use cases
export const loginAction = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { extra }) => {
    const { loginUseCase } = extra as { loginUseCase: LoginUseCase };
    return await loginUseCase.execute(payload);
  }
);

export const registerAction = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { extra }) => {
    const { registerUseCase } = extra as { registerUseCase: RegisterUseCase };
    return await registerUseCase.execute(payload);
  }
);

export const forgotPasswordAction = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: ForgotPasswordPayload, { extra }) => {
    const { forgotPasswordUseCase } = extra as { forgotPasswordUseCase: ForgotPasswordUseCase };
    return await forgotPasswordUseCase.execute(payload);
  }
);

export const resetPasswordAction = createAsyncThunk(
  'auth/resetPassword',
  async (payload: ResetPasswordPayload, { extra }) => {
    const { resetPasswordUseCase } = extra as { resetPasswordUseCase: ResetPasswordUseCase };
    return await resetPasswordUseCase.execute(payload);
  }
);

export const logoutAction = createAsyncThunk('auth/logout', async (_, { extra }) => {
  const { logoutUseCase } = extra as { logoutUseCase: LogoutUseCase };
  return await logoutUseCase.execute();
});
