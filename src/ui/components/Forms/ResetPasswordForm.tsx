import React, { useState, useCallback } from 'react';
import { Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { validatePassword } from '@domain/services/validationService';
import { ResetPasswordPayload } from '@domain/types/apiSchema';
import { ResetPasswordFormData } from '@domain/types/forms';
import PasswordStrengthMeter from '@ui/components/PasswordStrengthMeter';
import { useAuth } from '@ui/hooks/useAuth';
import { useForm } from '@ui/hooks/useForm';

interface ResetPasswordFormProps {
  tokenProp?: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ tokenProp = '' }) => {
  const { t } = useTranslation();
  const { resetPassword, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = useCallback(
    (values: ResetPasswordFormData) => {
      const errors: Partial<ResetPasswordFormData> = {};
      if (!values.password) {
        errors.password = t('errors.password.required');
      } else if (!validatePassword(values.password)) {
        errors.password = t('errors.password.invalid');
      }
      if (!values.confirmPassword) {
        errors.confirmPassword = t('errors.password.confirm_required');
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = t('errors.password.mismatch');
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
  } = useForm<ResetPasswordFormData>({
    initialValues: {
      password: '',
      confirmPassword: '',
      token: tokenProp,
    },
    validate,
    onSubmit: async (data: ResetPasswordFormData) => {
      // Only send password and token to server, exclude confirmPassword
      const payload: ResetPasswordPayload = {
        password: data.password,
        token: tokenProp,
      };
      await resetPassword(payload);
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
            {showPassword ? '🙈' : '👁️'}
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
            {showConfirmPassword ? '🙈' : '👁️'}
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
