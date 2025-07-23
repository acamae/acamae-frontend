import { User } from '@domain/entities/User';

export interface LoginFormData extends Pick<User, 'email' | 'password'> {}

export interface RegisterFormData extends Pick<User, 'email' | 'password' | 'username'> {
  confirmPassword: string;
  terms: boolean;
}

export interface ForgotPasswordFormData extends Pick<User, 'email'> {}

export interface ResetPasswordFormData extends Pick<User, 'password'> {
  confirmPassword: string;
  password: string;
  token: string;
}

export interface ResendVerificationFormData {
  identifier: string;
}
