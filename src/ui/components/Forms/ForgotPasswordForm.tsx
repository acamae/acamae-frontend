import React, { useCallback } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { validateEmail } from '@domain/services/validationService';
import { ForgotPasswordPayload } from '@domain/types/apiSchema';
import { ForgotPasswordFormData } from '@domain/types/forms';
import { useAuth } from '@ui/hooks/useAuth';
import { useForm } from '@ui/hooks/useForm';

const ForgotPasswordForm: React.FC = () => {
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

  const { values, errors, touched, isSubmitting, handleChange, handleSubmit } =
    useForm<ForgotPasswordFormData>({
      initialValues: { email: '' },
      validate,
      onSubmit: async (payload: ForgotPasswordPayload) => {
        await forgotPassword(payload);
      },
    });

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
          isInvalid={touched.email && !!errors.email}
          aria-invalid={touched.email && !!errors.email}
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
        <Form.Control.Feedback type="invalid" data-testid="forgot-password-form-email-error">
          {errors.email}
        </Form.Control.Feedback>
      </Form.Group>
      <div className="d-grid">
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting || loading}
          aria-busy={isSubmitting || loading}
          data-testid="forgot-password-form-button">
          {isSubmitting || loading ? t('forgot.loading') : t('forgot.submit')}
        </Button>
      </div>
    </Form>
  );
};

export default ForgotPasswordForm;
