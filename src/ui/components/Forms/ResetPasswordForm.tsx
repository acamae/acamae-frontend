import React, { useState, useCallback } from 'react';
import { Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { validatePassword } from '@domain/services/validationService';
import { ResetPasswordPayload } from '@domain/types/apiSchema';
import { ResetPasswordFormData } from '@domain/types/forms';
import PasswordStrengthMeter from '@ui/components/PasswordStrengthMeter';
import { useAuth } from '@ui/hooks/useAuth';
import { useForm } from '@ui/hooks/useForm';
import { useToast } from '@ui/hooks/useToast';

interface ResetPasswordFormProps {
  tokenProp?: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ tokenProp = '' }) => {
  const { t } = useTranslation();
  const { resetPassword, loading } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const validate = useCallback(
    (values: ResetPasswordPayload) => {
      const errors: Partial<ResetPasswordPayload> = {};
      if (!values.password) {
        errors.password = t('errors.password.required');
      } else if (!validatePassword(values.password)) {
        errors.password = t('errors.password.invalid');
      }
      return errors;
    },
    [t]
  );

  const { values, errors, touched, handleChange, handleSubmit, isSubmitting } =
    useForm<ResetPasswordFormData>({
      initialValues: { password: '', token: tokenProp },
      validate,
      onSubmit: async (payload: ResetPasswordPayload) => {
        if (!payload.token || payload.token !== tokenProp) {
          toast.error(t('reset.invalid_token'));
          return; // do not submit the form
        }
        await resetPassword(payload);
      },
    });

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
            isInvalid={touched.password && !!errors.password}
            aria-invalid={touched.password && !!errors.password}
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
        <Form.Control.Feedback type="invalid" data-testid="reset-password-form-password-error">
          {errors.password}
        </Form.Control.Feedback>
        <PasswordStrengthMeter password={values.password ?? ''} t={t} />
      </Form.Group>
      <div className="d-grid">
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting || loading}
          aria-busy={isSubmitting || loading}
          data-testid="reset-password-form-button">
          {isSubmitting || loading ? t('reset.saving') : t('reset.submit')}
        </Button>
      </div>
    </Form>
  );
};

export default ResetPasswordForm;
