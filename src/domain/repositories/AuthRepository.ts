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
  ValidateResetTokenPayload,
  ResetTokenValidationResponse,
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
  validateResetToken(payload: ValidateResetTokenPayload): ApiPromise<ResetTokenValidationResponse>;
  logout(): ApiPromise<void>;
  getCurrentUser(): ApiPromise<User>;
  verifyEmail(payload: VerifyEmailPayload): ApiPromise<EmailVerificationResponse>;
  resendVerification(payload: ResendVerificationPayload): ApiPromise<void>;
}
