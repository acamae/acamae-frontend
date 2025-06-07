import { useState, useEffect, useCallback } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { validateEmail, validatePassword } from '@/domain/services/validationService';
import { useAuth } from '@ui/hooks/useAuth';
import { useForm } from '@ui/hooks/useForm';
import { useToast } from '@ui/hooks/useToast';

interface LoginFormProps {
  redirectTo?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ redirectTo = '/dashboard' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { login, loading, error, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { values, errors, touched, handleChange, handleSubmit, isSubmitting } = useForm<{
    email: string;
    password: string;
  }>({
    initialValues: {
      email: '',
      password: '',
    },

    validate: useCallback(
      (values: { email: string; password: string }) => {
        const errors: Partial<{ email: string; password: string }> = {};
        if (!validateEmail(values.email)) {
          errors.email = t('errors.email.invalid');
        }
        if (!validatePassword(values.password)) {
          errors.password = t('errors.password.invalid');
        }
        return errors;
      },
      [t]
    ),

    onSubmit: async values => {
      try {
        await login({ email: values.email, password: values.password });
      } catch (err: unknown) {
        const errorMessage =
          typeof err === 'string'
            ? err
            : (err as { message?: string })?.message || t('login.failed');
        toast.error(errorMessage, t('login.failed'));
      }
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error, t('login.failed'));
    }
  }, [error, t, toast]);

  useEffect(() => {
    if (isAuthenticated) {
      toast.success(t('login.success'), t('login.welcome'));
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo, t, toast]);

  return (
    <Form onSubmit={handleSubmit} noValidate data-testid="login-form">
      <Form.Group className="mb-3" controlId="email">
        <Form.Label data-testid="login-form-email-label">{t('login.email')}</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          isInvalid={touched.email && !!errors.email}
          data-testid="login-form-email-input"
        />
        <Form.Text className="text-muted" data-testid="login-form-email-help">
          {t('login.email_help')}
        </Form.Text>
        <Form.Control.Feedback type="invalid" data-testid="login-form-email-error">
          {errors.email}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="password">
        <Form.Label data-testid="login-form-password-label">{t('login.password')}</Form.Label>
        <InputGroup>
          <Form.Control
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={values.password}
            onChange={handleChange}
            isInvalid={touched.password && !!errors.password}
            data-testid="login-form-password-input"
          />
          <Button
            variant="outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={t(showPassword ? 'login.toggle_password' : 'login.toggle_password')}
            tabIndex={-1}
            data-testid="login-form-password-toggle">
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </Button>
          <Form.Control.Feedback type="invalid" data-testid="login-form-password-error">
            {errors.password}
          </Form.Control.Feedback>
        </InputGroup>
        <Form.Text className="text-muted" data-testid="login-form-password-help">
          {t('login.password_help')}
        </Form.Text>
      </Form.Group>

      <div className="d-grid">
        <Button
          variant="primary"
          type="submit"
          disabled={loading || isSubmitting}
          data-testid="login-form-button">
          {loading || isSubmitting ? t('login.accessing') : t('login.button')}
        </Button>
      </div>
    </Form>
  );
};

export default LoginForm;
