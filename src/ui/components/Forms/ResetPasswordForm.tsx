import React, { useState, useCallback } from 'react';
import { Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { ApiResponse } from '@/domain/types/apiSchema';
import { validatePassword } from '@domain/services/validationService';
import { useAuth } from '@ui/hooks/useAuth';
import { useForm } from '@ui/hooks/useForm';
import { useToast } from '@ui/hooks/useToast';

import PasswordStrengthMeter from './PasswordStrengthMeter';

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token = '' }) => {
  const { t } = useTranslation();
  const { resetPassword, loading, error } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const { values, errors, touched, handleChange, handleSubmit, isSubmitting } = useForm<{
    password: string;
  }>({
    initialValues: { password: '' },

    validate: useCallback(
      (values: { password: string }) => {
        const errors: Partial<{ password: string }> = {};
        if (!values.password) {
          errors.password = t('errors.password.required');
        } else if (!validatePassword(values.password)) {
          errors.password = t('errors.password.invalid');
        }
        return errors;
      },
      [t]
    ),

    onSubmit: async ({ password }) => {
      if (!token) {
        setMessage(t('reset.invalid_token'));
        setIsSuccess(false);
        return;
      }
      const action = await resetPassword({ token, newPassword: password });
      const result = action.payload as ApiResponse<void>;
      setIsSuccess(!error);
      setMessage(error ? t('reset.failed') : t('reset.success'));

      if (!error) {
        toast.success(result?.message || t('reset.success'));
      } else {
        toast.error(result?.message || t('reset.failed'));
      }
    },
  });

  if (message) {
    return (
      <Alert
        variant={isSuccess ? 'success' : 'danger'}
        role={isSuccess ? 'status' : 'alert'}
        aria-live="polite"
        data-testid={isSuccess ? 'alert-success' : 'alert-error'}>
        {message}
      </Alert>
    );
  }

  return (
    <>
      {token ? (
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label data-testid="label-reset-password">{t('reset.password')}</Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={values.password}
                onChange={handleChange}
                isInvalid={touched.password && !!errors.password}
                required
                autoComplete="new-password"
                aria-describedby="passwordHelp"
                data-testid="input-password"
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={t('register.toggle_password')}
                data-testid="btn-toggle-password"
                tabIndex={-1}>
                {showPassword ? '🙈' : '👁️'}
              </Button>
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </InputGroup>
            <Form.Text id="passwordHelp" className="text-muted">
              {t('register.password_help')}
            </Form.Text>
            <PasswordStrengthMeter password={values.password} t={t} />
          </Form.Group>
          <div className="d-grid">
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting || loading}
              data-testid="btn-reset-password">
              {isSubmitting || loading ? t('reset.saving') : t('reset.submit')}
            </Button>
          </div>
        </Form>
      ) : (
        <Alert variant="danger" role="status" aria-live="polite" data-testid="alert-error">
          {t('reset.invalid_token')}
        </Alert>
      )}
    </>
  );
};

export default ResetPasswordForm;
