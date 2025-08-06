import React, { useState, useCallback } from 'react';
import { Alert, Button, Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { ResetPasswordPayload } from '@domain/types/apiSchema';
import { ResetPasswordFormData } from '@domain/types/forms';
import { APP_ROUTES } from '@shared/constants/appRoutes';
import PasswordStrengthMeter from '@ui/components/PasswordStrengthMeter';
import { useAuth } from '@ui/hooks/useAuth';
import { useForm } from '@ui/hooks/useForm';

interface ResetPasswordFormProps {
  tokenProp?: string;
  onSuccess?: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ tokenProp = '', onSuccess }) => {
  const { t } = useTranslation();
  const { resetPassword, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = useCallback(
    (values: ResetPasswordFormData) => {
      const errors: Partial<ResetPasswordFormData> = {};

      if (!values.password) {
        errors.password = t('reset.password_required');
      } else if (values.password.length < 8) {
        errors.password = t('reset.password_min_length');
      }

      if (!values.confirmPassword) {
        errors.confirmPassword = t('reset.confirm_password_required');
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = t('reset.passwords_not_match');
      }

      return errors;
    },
    [t]
  );

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    isThrottled,
    timeUntilNextSubmission,
    remainingAttempts,
    hasValidationErrors,
    activateThrottle,
  } = useForm<ResetPasswordFormData>({
    initialValues: {
      password: '',
      confirmPassword: '',
      token: tokenProp,
    },
    validate,
    onSubmit: async (data: ResetPasswordFormData) => {
      const payload: ResetPasswordPayload = {
        password: data.password,
        token: tokenProp,
      };
      try {
        await resetPassword(payload).unwrap();
        if (onSuccess) onSuccess();
      } catch (error: unknown) {
        // Manejar diferentes tipos de errores del backend
        if (error && typeof error === 'object' && 'code' in error) {
          const errorCode = (error as { code: string }).code;

          switch (errorCode) {
            case ApiErrorCodes.AUTH_TOKEN_EXPIRED:
              navigate(APP_ROUTES.RESET_PASSWORD_EXPIRED);
              return;
            case ApiErrorCodes.AUTH_TOKEN_INVALID:
              navigate(APP_ROUTES.RESET_PASSWORD_ERROR);
              return;
            case ApiErrorCodes.AUTH_UPDATE_FAILED:
              navigate(APP_ROUTES.RESET_PASSWORD_ERROR);
              return;
            default:
              // Para otros errores, el feedbackMiddleware mostrará el toast
              break;
          }
        }

        // Manejar errores de throttling
        if (
          activateThrottle &&
          error &&
          typeof error === 'object' &&
          'status' in error &&
          (error as { status: unknown }).status === 429
        ) {
          activateThrottle();
        }
      }
    },
    enableThrottling: true,
    formName: 'reset-password-form',
  });

  const getButtonText = () => {
    if (isSubmitting || loading) {
      return t('reset.saving');
    }
    if (isThrottled && timeUntilNextSubmission && timeUntilNextSubmission > 0) {
      return `${t('reset.submit')} (${Math.ceil(timeUntilNextSubmission / 1000)}s)`;
    }
    return t('reset.submit');
  };

  const showAttemptsWarning =
    remainingAttempts !== undefined && remainingAttempts > 0 && remainingAttempts <= 2;

  if (!tokenProp) {
    return (
      <Alert variant="danger" aria-live="polite" data-testid="alert-error">
        <output>{t('reset.invalid_token')}</output>
      </Alert>
    );
  }

  return (
    <Form onSubmit={handleSubmit} noValidate data-testid="reset-password-form">
      <Form.Group className="mb-3" controlId="password">
        <Form.Control
          type="hidden"
          name="token"
          readOnly
          value={tokenProp}
          data-testid="reset-password-form-token"
        />
        <Form.Label data-testid="label-reset-password">{t('reset.password')}</Form.Label>
        <InputGroup
          hasValidation
          className={touched.password && !!errors.password ? 'is-invalid' : ''}>
          <Form.Control
            size="lg"
            className="bg-white bg-opacity-5"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            isInvalid={touched.password && !!errors.password}
            aria-invalid={touched.password && !!errors.password ? 'true' : 'false'}
            aria-required="true"
            aria-errormessage="reset-password-form-password-error"
            required
            autoComplete="new-password"
            aria-describedby="passwordHelp"
            data-testid="reset-password-form-password-input"
          />
          <Button
            variant="outline-secondary"
            onClick={() => setShowPassword(prev => !prev)}
            aria-label={t('register.toggle_password')}
            data-testid="btn-toggle-password"
            tabIndex={-1}>
            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
          </Button>
        </InputGroup>
        <Form.Text
          id="passwordHelp"
          className="text-muted"
          data-testid="reset-password-form-password-help">
          {t('register.password_help')}
        </Form.Text>
        <Form.Control.Feedback
          type="invalid"
          aria-live="polite"
          aria-atomic="true"
          role="alert"
          data-testid="reset-password-form-password-error">
          {errors.password}
        </Form.Control.Feedback>
        <PasswordStrengthMeter password={values.password ?? ''} t={t} />
      </Form.Group>

      <Form.Group className="mb-3" controlId="confirmPassword">
        <Form.Label data-testid="label-reset-confirm-password">
          {t('reset.confirm_password')}
        </Form.Label>
        <InputGroup
          hasValidation
          className={touched.confirmPassword && !!errors.confirmPassword ? 'is-invalid' : ''}>
          <Form.Control
            size="lg"
            className="bg-white bg-opacity-5"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            isInvalid={touched.confirmPassword && !!errors.confirmPassword}
            aria-invalid={touched.confirmPassword && !!errors.confirmPassword ? 'true' : 'false'}
            aria-required="true"
            aria-errormessage="reset-password-form-confirm-password-error"
            required
            autoComplete="new-password"
            aria-describedby="confirmPasswordHelp"
            data-testid="reset-password-form-confirm-password-input"
          />
          <Button
            variant="outline-secondary"
            onClick={() => setShowConfirmPassword(prev => !prev)}
            aria-label={t('register.toggle_password')}
            data-testid="btn-toggle-confirm-password"
            tabIndex={-1}>
            <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
          </Button>
        </InputGroup>
        <Form.Text
          id="confirmPasswordHelp"
          className="text-muted"
          data-testid="reset-password-form-confirm-password-help">
          {t('reset.confirm_password_help')}
        </Form.Text>
        <Form.Control.Feedback
          type="invalid"
          aria-live="polite"
          aria-atomic="true"
          role="alert"
          data-testid="reset-password-form-confirm-password-error">
          {errors.confirmPassword}
        </Form.Control.Feedback>
      </Form.Group>

      {showAttemptsWarning && (
        <div
          className="alert alert-warning mb-3"
          role="alert"
          data-testid="reset-password-form-attempts-warning">
          <small>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {t('security.throttle.attempts_remaining', { count: remainingAttempts })}
          </small>
        </div>
      )}

      <div className="d-grid">
        <Button
          size="lg"
          variant="outline-theme"
          className="d-block w-100 fw-500 mb-3"
          type="submit"
          disabled={hasValidationErrors || loading || isSubmitting || isThrottled}
          aria-busy={loading || isSubmitting || isThrottled}
          data-testid="reset-password-form-button">
          {getButtonText()}
        </Button>
      </div>
    </Form>
  );
};

export default ResetPasswordForm;
