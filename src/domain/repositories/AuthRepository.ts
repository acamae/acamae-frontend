import { User } from '@domain/entities/User';
import { Repository } from '@domain/repositories/repository';
import {
  ApiPromise,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  ResendVerificationPayload,
  VerifyEmailPayload,
  EmailVerificationResponse,
} from '@domain/types/apiSchema';

/**
 * Auth repository interface
 * Defines methods for User operations
 */
export interface IAuthRepository extends Repository<User> {
  login(payload: LoginPayload): ApiPromise<User>;
  register(payload: RegisterPayload): ApiPromise<void>;
  forgotPassword(payload: ForgotPasswordPayload): ApiPromise<void>;
  resetPassword(payload: ResetPasswordPayload): ApiPromise<void>;
  logout(): ApiPromise<void>;
  getCurrentUser(): ApiPromise<User>;
  resendVerification(payload: ResendVerificationPayload): ApiPromise<void>;
  verifyEmail(payload: VerifyEmailPayload): ApiPromise<EmailVerificationResponse>;
}
