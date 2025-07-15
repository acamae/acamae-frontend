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

  const login = async (loginPayload: LoginPayload) => {
    return await dispatch(loginAction(loginPayload));
  };

  const register = async (registerPayload: RegisterPayload) => {
    return await dispatch(registerAction(registerPayload));
  };

  const forgotPassword = async (forgotPasswordPayload: ForgotPasswordPayload) => {
    return await dispatch(forgotPasswordAction(forgotPasswordPayload));
  };

  const resetPassword = async (resetPasswordPayload: ResetPasswordPayload) => {
    return await dispatch(resetPasswordAction(resetPasswordPayload));
  };

  const logout = async () => {
    return await dispatch(logoutAction());
  };

  const resendVerification = async (payload: ResendVerificationPayload) => {
    return await dispatch(resendVerificationAction(payload));
  };

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
