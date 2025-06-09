export interface LoginFormData {
  email: string;
  password: string;
  [key: string]: string;
}

export interface RegisterFormData extends LoginFormData {
  confirm_password: string;
  username: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface NewPasswordFormData {
  password: string;
  confirm_password: string;
}
