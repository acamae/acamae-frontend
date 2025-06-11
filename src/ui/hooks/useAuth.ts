import {
  loginAction,
  registerAction,
  logoutAction,
  forgotPasswordAction,
  resetPasswordAction,
  resendVerificationAction,
} from '@application/state/actions/auth.actions';
import { useAppDispatch, useAppSelector } from '@application/state/hooks';
import {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  ResendVerificationPayload,
  ApiError,
} from '@domain/types/apiSchema';
import type { RootState } from '@domain/types/redux';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, loading } = useAppSelector(
    (state: RootState) => state.auth
  );

  const login = async (loginPayload: LoginPayload) => {
    const result = await dispatch(loginAction(loginPayload)).unwrap();
    if (!result.success) {
      throw new ApiError({ ...result });
    }
    return result.data;
  };

  const register = async (registerPayload: RegisterPayload) => {
    const result = await dispatch(registerAction(registerPayload)).unwrap();
    if (!result.success) {
      throw new ApiError({ ...result });
    }
    return result.data;
  };

  const forgotPassword = async (forgotPasswordPayload: ForgotPasswordPayload) => {
    const result = await dispatch(forgotPasswordAction(forgotPasswordPayload)).unwrap();
    if (!result.success) {
      throw new ApiError({ ...result });
    }
    return result.data;
  };

  const resetPassword = async (resetPasswordPayload: ResetPasswordPayload) => {
    const result = await dispatch(resetPasswordAction(resetPasswordPayload)).unwrap();
    if (!result.success) {
      throw new ApiError({ ...result });
    }
    return result.data;
  };

  const logout = async () => {
    const result = await dispatch(logoutAction()).unwrap();
    if (!result.success) {
      throw new ApiError({ ...result });
    }
    return result.data;
  };

  const resendVerification = async (payload: ResendVerificationPayload) => {
    const result = await dispatch(resendVerificationAction(payload)).unwrap();
    if (!result.success) {
      throw new ApiError({ ...result });
    }
    return result.data;
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    resendVerification,
  };
};
