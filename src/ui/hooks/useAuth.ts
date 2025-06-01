import {
  loginAction,
  registerAction,
  logoutAction,
  forgotPasswordAction,
  resetPasswordAction,
} from '@application/state/actions/auth.actions';
import { useAppDispatch, useAppSelector } from '@application/state/hooks';
import {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from '@domain/types/apiSchema';
import type { RootState } from '@domain/types/redux';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, loading, error } = useAppSelector(
    (state: RootState) => state.auth
  );
  const login = (loginPayload: LoginPayload) => dispatch(loginAction(loginPayload));
  const register = (registerPayload: RegisterPayload) => dispatch(registerAction(registerPayload));
  const forgotPassword = (forgotPasswordPayload: ForgotPasswordPayload) =>
    dispatch(forgotPasswordAction(forgotPasswordPayload));
  const resetPassword = (resetPasswordPayload: ResetPasswordPayload) =>
    dispatch(resetPasswordAction(resetPasswordPayload));
  const logout = () => dispatch(logoutAction());

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };
};
