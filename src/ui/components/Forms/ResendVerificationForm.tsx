import React, { useCallback } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { validateEmail } from '@/domain/services/validationService';
import { ResendVerificationPayload } from '@/domain/types/apiSchema';
import { useAuth } from '@ui/hooks/useAuth';
import { useForm } from '@ui/hooks/useForm';
import { useToast } from '@ui/hooks/useToast';

const ResendVerificationForm: React.FC = () => {
  const { t } = useTranslation();
  const { resendVerification, loading } = useAuth();
  const toast = useToast();

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

  const { values, errors, touched, handleChange, handleSubmit, isSubmitting } =
    useForm<ResendVerificationPayload>({
      initialValues: {
        identifier: '',
      },
      validate,
      onSubmit: async (payload: ResendVerificationPayload) => {
        try {
          await resendVerification(payload);
          toast.success(t('verification.resend.success'));
        } catch (error: unknown) {
          if (error instanceof Error) {
            toast.error(t('verification.resend.failed'), error.message);
          } else {
            toast.error(t('verification.resend.failed'));
          }
        }
      },
    });

  return (
    <Form onSubmit={handleSubmit} noValidate data-testid="resend-verification-form">
      <Form.Group className="mb-3" controlId="identifier">
        <Form.Label data-testid="resend-verification-form-identifier-label">
          {t('verification.resend.label')}
        </Form.Label>
        <Form.Control
          type="text"
          name="identifier"
          value={values.identifier}
          onChange={handleChange}
          isInvalid={touched.identifier && !!errors.identifier}
          required
          autoFocus
          data-testid="resend-verification-form-identifier-input"
        />
        <Form.Control.Feedback
          type="invalid"
          data-testid="resend-verification-form-identifier-error">
          {errors.identifier}
        </Form.Control.Feedback>
      </Form.Group>

      <div className="d-grid">
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting || loading}
          aria-busy={isSubmitting || loading}
          data-testid="resend-verification-form-button">
          {isSubmitting || loading
            ? t('verification.resend.loading')
            : t('verification.resend.button')}
        </Button>
      </div>
    </Form>
  );
};

export default ResendVerificationForm;
