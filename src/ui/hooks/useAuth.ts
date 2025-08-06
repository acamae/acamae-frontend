import {
  loginAction,
  registerAction,
  logoutAction,
  forgotPasswordAction,
  resetPasswordAction,
  resendVerificationAction,
} from '@application/state/actions/auth.actions';
import { useAppDispatch, useAppSelector } from '@application/state/hooks';
import { UserRole } from '@domain/constants/user';
import {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  ResendVerificationPayload,
} from '@domain/types/apiSchema';
import type { RootState } from '@domain/types/redux';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, loading } = useAppSelector(
    (state: RootState) => state.auth
  );

  const login = (loginPayload: LoginPayload) => dispatch(loginAction(loginPayload));

  const register = (registerPayload: RegisterPayload) => dispatch(registerAction(registerPayload));

  const forgotPassword = (forgotPasswordPayload: ForgotPasswordPayload) =>
    dispatch(forgotPasswordAction(forgotPasswordPayload));

  const resetPassword = (resetPasswordPayload: ResetPasswordPayload) =>
    dispatch(resetPasswordAction(resetPasswordPayload));

  const logout = () => dispatch(logoutAction());

  const resendVerification = (payload: ResendVerificationPayload) =>
    dispatch(resendVerificationAction(payload));

  /**
   * Check if the current user has one of the specified roles
   * @param roles - Array of roles to check against
   * @returns boolean indicating if user has one of the roles
   */
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user?.role) return false;

    const rolesToCheck = Array.isArray(roles) ? roles : [roles];
    return rolesToCheck.includes(user.role);
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
    hasRole,
  };
};
