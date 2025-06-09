import { useState, useEffect, useCallback } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { validateEmail, validatePassword } from '@/domain/services/validationService';
import { APP_ROUTES } from '@/shared/constants/appRoutes';
import { useAuth } from '@ui/hooks/useAuth';
import { useForm } from '@ui/hooks/useForm';
import { useToast } from '@ui/hooks/useToast';

const LoginForm: React.FC = () => {
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

    onSubmit: values => {
      login({ email: values.email, password: values.password });
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
      navigate(APP_ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate, APP_ROUTES.DASHBOARD, t, toast]);

  return (
    <Form onSubmit={handleSubmit} noValidate data-testid="login-form">
      <Form.Group className="mb-3" controlId="email">
        <Form.Label data-testid="login-form-email-label">{t('login.email')}</Form.Label>
        <Form.Control
          size="lg"
          className="bg-white bg-opacity-5"
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
            size="lg"
            className="bg-white bg-opacity-5"
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
          variant="outline-theme"
          size="lg"
          className="d-block w-100 fw-500 mb-3"
          type="submit"
          disabled={loading || isSubmitting}
          data-testid="login-form-button">
          {loading || isSubmitting ? t('login.accessing') : t('login.button')}
        </Button>
      </div>
      <div className="text-center text-inverse text-opacity-50">
        {t('login.no_account')}{' '}
        <a href={APP_ROUTES.REGISTER} data-discover="true">
          {t('login.sign_up')}
        </a>{' '}
        {t('login.no_account_suffix')}
      </div>
    </Form>
  );
};

export default LoginForm;
