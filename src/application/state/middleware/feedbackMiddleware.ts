import { type Middleware } from '@reduxjs/toolkit';
import i18n from 'i18next';

import {
  forgotPasswordAction,
  loginAction,
  logoutAction,
  registerAction,
  resendVerificationAction,
  resetPasswordAction,
} from '@application/state/actions/auth.actions';
import { APP_ROUTES } from '@shared/constants/appRoutes';
import { ToastContextType } from '@shared/services/ToastProvider';

/**
 * Runtime-injected helpers so the middleware has no direct dependency on React hooks.
 */
let toastApi: ToastContextType;
let navigateFn: (path: string) => void | Promise<void>;

export const configureFeedback = (deps: {
  toast: ToastContextType;
  navigate: (path: string) => void | Promise<void>;
}) => {
  toastApi = deps.toast;
  navigateFn = deps.navigate;
};

type Handler = () => void;
type Action = {
  type: string;
  error?: { message?: string };
  payload?: {
    success?: boolean;
    message?: string;
    status?: string | number;
    code?: string;
  };
};

const showSuccess =
  (titleKey: string, bodyKey?: string, redirect?: string): Handler =>
  (): void => {
    toastApi.success(i18n.t(titleKey), bodyKey ? i18n.t(bodyKey) : undefined);
    if (redirect) navigateFn(redirect);
  };

const showError =
  (titleKey: string) =>
  (a: Action): void => {
    toastApi.error(a.payload?.message ?? i18n.t('errors.unknown'), i18n.t(titleKey));
  };

const successMap: Record<string, Handler> = {
  [registerAction.fulfilled.type]: showSuccess(
    'register.success',
    'register.welcome',
    APP_ROUTES.VERIFY_EMAIL_SENT
  ),
  [loginAction.fulfilled.type]: showSuccess('login.success', 'login.welcome', APP_ROUTES.DASHBOARD),
  [forgotPasswordAction.fulfilled.type]: showSuccess('forgot.success', 'forgot.check_email'),
  [resetPasswordAction.fulfilled.type]: showSuccess('reset.success'),
  [logoutAction.fulfilled.type]: showSuccess('logout.success'),
  [resendVerificationAction.fulfilled.type]: showSuccess('verification.resend.success'),
};

const errorMap: Record<string, (action: Action) => void> = {
  [registerAction.rejected.type]: showError('register.failed'),
  [loginAction.rejected.type]: showError('login.failed'),
  [logoutAction.rejected.type]: showError('logout.failed'),
  [forgotPasswordAction.rejected.type]: showError('forgot.failed'),
  [resetPasswordAction.rejected.type]: showError('reset.failed'),
  [resendVerificationAction.rejected.type]: showError('verification.resend.failed'),
};

export const feedbackMiddleware: Middleware = _store => next => action => {
  if (!toastApi || !navigateFn) return next(action);

  const act = action as Action; // ① narrowing

  successMap[act.type]?.();
  errorMap[act.type]?.(act);

  return next(action);
};
