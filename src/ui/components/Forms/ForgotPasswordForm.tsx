import React, { useCallback } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { validateEmail } from '@domain/services/validationService';
import api from '@shared/services/axiosService';
import { useForm } from '@ui/hooks/useForm';
import { useToast } from '@ui/hooks/useToast';

const ForgotPasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const validate = useCallback(
    (values: { email: string }) => {
      const errors: Partial<{ email: string }> = {};
      if (!values.email) {
        errors.email = t('errors.email.required');
      } else if (!validateEmail(values.email)) {
        errors.email = t('errors.email.invalid');
      }
      return errors;
    },
    [t]
  );

  const { values, errors, touched, isSubmitting, handleChange, handleSubmit } = useForm<{
    email: string;
  }>({
    initialValues: { email: '' },
    validate,
    onSubmit: async ({ email }) => {
      try {
        await api.post('/auth/forgot-password', { email });
        toast.success(t('forgot.success'), t('forgot.check_email'));
      } catch (err: unknown) {
        // Assume standard API error structure
        const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
        if (code === 'USER_NOT_FOUND') {
          toast.error(t('errors.email.not_found'), t('forgot.failed'));
        } else {
          toast.error(t('forgot.unknown_error'), t('forgot.failed'));
        }
      }
    },
  });

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Form.Group className="mb-3" controlId="email">
        <Form.Label>{t('forgot.email')}</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          isInvalid={touched.email && !!errors.email}
          required
          autoComplete="email"
          aria-describedby="emailHelp"
          data-testid="input-email"
        />
        <Form.Text id="emailHelp" className="text-muted">
          {t('forgot.email_help')}
        </Form.Text>
        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
      </Form.Group>
      <div className="d-grid">
        <Button
          variant="primary"
          type="submit"
          data-testid="btn-forgot-password"
          disabled={isSubmitting}
          aria-busy={isSubmitting}>
          {t('forgot.submit')}
        </Button>
      </div>
    </Form>
  );
};

export default ForgotPasswordForm;
