import React, { useCallback } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';

import { validateEmail } from '@domain/services/validationService';
import { ResendVerificationPayload } from '@domain/types/apiSchema';
import { ResendVerificationFormData } from '@domain/types/forms';
import { useAuth } from '@ui/hooks/useAuth';
import { useForm } from '@ui/hooks/useForm';

const ResendVerificationForm: React.FC = () => {
  const { t } = useTranslation();
  const { resendVerification, loading } = useAuth();

  const validate = useCallback(
    (values: ResendVerificationPayload) => {
      const errors: Partial<ResendVerificationPayload> = {};
      if (!values.identifier || !validateEmail(values.identifier)) {
        errors.identifier = t('errors.email.invalid');
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
  } = useForm<ResendVerificationFormData>({
    initialValues: {
      identifier: '',
    },
    validate,
    onSubmit: async (data: ResendVerificationPayload) => {
      await resendVerification(data);
    },
    enableThrottling: true,
    formName: 'resend-verification-form',
  });

  const getButtonText = () => {
    if (isSubmitting || loading) {
      return t('verification.resend.loading');
    }
    if (isThrottled && timeUntilNextSubmission && timeUntilNextSubmission > 0) {
      return `${t('verification.resend.button')} (${Math.ceil(timeUntilNextSubmission / 1000)}s)`;
    }
    return t('verification.resend.button');
  };

  const showAttemptsWarning =
    remainingAttempts !== undefined && remainingAttempts > 0 && remainingAttempts <= 2;

  return (
    <>
      <p className="text-muted">
        <Trans
          i18nKey="global.required_asterisk"
          components={{
            abbr: <abbr className="text-danger" title={t('global.required')} />,
          }}
        />
      </p>
      <Form onSubmit={handleSubmit} noValidate data-testid="email-verification-resend-form">
        <Form.Group className="mb-3" controlId="identifier">
          <Form.Label data-testid="email-verification-resend-form-identifier-label">
            {t('verification.resend.label')}
          </Form.Label>
          <Form.Control
            size="lg"
            className="bg-white bg-opacity-5"
            type="text"
            name="identifier"
            value={values.identifier}
            onChange={handleChange}
            onBlur={handleBlur}
            isInvalid={touched.identifier && !!errors.identifier}
            aria-invalid={touched.identifier && !!errors.identifier ? 'true' : 'false'}
            aria-required="true"
            aria-errormessage="email-verification-resend-form-identifier-error"
            required
            autoFocus
            data-testid="email-verification-resend-form-identifier-input"
          />
          <Form.Control.Feedback
            type="invalid"
            aria-live="polite"
            aria-atomic="true"
            role="alert"
            data-testid="email-verification-resend-form-identifier-error">
            {errors.identifier}
          </Form.Control.Feedback>
        </Form.Group>

        {showAttemptsWarning && (
          <div
            className="alert alert-warning mb-3"
            role="alert"
            data-testid="email-verification-resend-form-attempts-warning">
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
            data-testid="email-verification-resend-form-button">
            {getButtonText()}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default ResendVerificationForm;
