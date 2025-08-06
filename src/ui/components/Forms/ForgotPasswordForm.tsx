import React, { useCallback } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { validateEmail } from '@domain/services/validationService';
import { ForgotPasswordPayload } from '@domain/types/apiSchema';
import { ForgotPasswordFormData } from '@domain/types/forms';
import { useAuth } from '@ui/hooks/useAuth';
import { useForm } from '@ui/hooks/useForm';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { forgotPassword, loading } = useAuth();
  const validate = useCallback(
    (values: ForgotPasswordPayload) => {
      const errors: Partial<ForgotPasswordPayload> = {};
      if (!values.email) {
        errors.email = t('errors.email.required');
      } else if (!validateEmail(values.email)) {
        errors.email = t('errors.email.invalid');
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
  } = useForm<ForgotPasswordFormData>({
    initialValues: {
      email: '',
    },
    validate,
    onSubmit: async (data: ForgotPasswordPayload) => {
      try {
        await forgotPassword(data).unwrap();
      } catch (error: unknown) {
        console.error(error);
      } finally {
        // Siempre redirigir, independientemente del resultado
        if (onSuccess) onSuccess();
      }
    },
    enableThrottling: true,
    formName: 'forgot-password-form',
  });

  const getButtonText = () => {
    if (isSubmitting || loading) {
      return t('global.loading');
    }
    if (isThrottled && timeUntilNextSubmission && timeUntilNextSubmission > 0) {
      return `${t('forgot.submit')} (${Math.ceil(timeUntilNextSubmission / 1000)}s)`;
    }
    return t('forgot.submit');
  };

  const showAttemptsWarning =
    remainingAttempts !== undefined && remainingAttempts > 0 && remainingAttempts <= 2;

  return (
    <Form onSubmit={handleSubmit} noValidate data-testid="forgot-password-form">
      <Form.Group className="mb-3" controlId="email">
        <Form.Label>{t('forgot.email')}</Form.Label>
        <Form.Control
          size="lg"
          className="bg-white bg-opacity-5"
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          isInvalid={touched.email && !!errors.email}
          aria-invalid={touched.email && !!errors.email ? 'true' : 'false'}
          aria-required="true"
          required
          autoComplete="email"
          aria-describedby="emailHelp"
          aria-errormessage="forgot-password-form-email-error"
          data-testid="forgot-password-form-email-input"
        />
        <Form.Text
          id="emailHelp"
          className="text-muted"
          data-testid="forgot-password-form-email-help">
          {t('forgot.email_help')}
        </Form.Text>
        <Form.Control.Feedback
          type="invalid"
          aria-live="polite"
          aria-atomic="true"
          role="alert"
          data-testid="forgot-password-form-email-error">
          {errors.email}
        </Form.Control.Feedback>
      </Form.Group>

      {showAttemptsWarning && (
        <div
          className="alert alert-warning mb-3"
          role="alert"
          data-testid="forgot-password-form-attempts-warning">
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
          data-testid="forgot-password-form-button">
          {getButtonText()}
        </Button>
      </div>
    </Form>
  );
};

export default ForgotPasswordForm;
