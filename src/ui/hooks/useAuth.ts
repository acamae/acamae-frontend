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
    try {
      const result = await dispatch(loginAction(loginPayload));
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { error };
    }
  };

  const register = async (registerPayload: RegisterPayload) => {
    try {
      const result = await dispatch(registerAction(registerPayload));
      return result;
    } catch (error) {
      // Ensure loading state is reset even when there's an error
      // The error will be handled by the Redux action and displayed via toast
      console.error('Registration error:', error);
      return { error };
    }
  };

  const forgotPassword = async (forgotPasswordPayload: ForgotPasswordPayload) => {
    try {
      const result = await dispatch(forgotPasswordAction(forgotPasswordPayload));
      return result;
    } catch (error) {
      console.error('Forgot password error:', error);
      return { error };
    }
  };

  const resetPassword = async (resetPasswordPayload: ResetPasswordPayload) => {
    try {
      const result = await dispatch(resetPasswordAction(resetPasswordPayload));
      return result;
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  };

  const logout = async () => {
    try {
      const result = await dispatch(logoutAction());
      return result;
    } catch (error) {
      console.error('Logout error:', error);
      return { error };
    }
  };

  const resendVerification = async (payload: ResendVerificationPayload) => {
    try {
      const result = await dispatch(resendVerificationAction(payload));
      return result;
    } catch (error) {
      console.error('Resend verification error:', error);
      return { error };
    }
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
