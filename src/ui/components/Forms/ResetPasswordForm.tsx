import React, { useState, useCallback } from 'react';
import { Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { ResetPasswordPayload } from '@/domain/types/apiSchema';
import { validatePassword } from '@domain/services/validationService';
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
      if (!values.newPassword) {
        errors.newPassword = t('errors.password.required');
      } else if (!validatePassword(values.newPassword)) {
        errors.newPassword = t('errors.password.invalid');
      }
      return errors;
    },
    [t]
  );

  const { values, errors, touched, handleChange, handleSubmit, isSubmitting } =
    useForm<ResetPasswordPayload>({
      initialValues: { newPassword: '', token: tokenProp },
      validate,
      onSubmit: async (payload: ResetPasswordPayload) => {
        if (!payload.token) {
          toast.error(t('reset.invalid_token'));
          return;
        }
        if (payload.token !== tokenProp) {
          toast.error(t('reset.invalid_token'));
          return;
        }
        try {
          await resetPassword(payload);
          toast.success(t('reset.success'));
        } catch (error: unknown) {
          if (error instanceof Error) {
            toast.error(t('reset.failed'), error.message);
          } else {
            toast.error(t('reset.failed'));
          }
        }
      },
    });

  if (!tokenProp) {
    return (
      <Alert variant="danger" role="status" aria-live="polite" data-testid="alert-error">
        {t('reset.invalid_token')}
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
        <InputGroup hasValidation>
          <Form.Control
            type={showPassword ? 'text' : 'password'}
            name="newPassword"
            value={values.newPassword}
            onChange={handleChange}
            isInvalid={touched.newPassword && !!errors.newPassword}
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
          {errors.newPassword}
        </Form.Control.Feedback>
        <PasswordStrengthMeter password={values.newPassword} t={t} />
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
