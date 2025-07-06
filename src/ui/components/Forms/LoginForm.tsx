import { useState, useCallback } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { validateEmail, validatePassword } from '@domain/services/validationService';
import { LoginPayload } from '@domain/types/apiSchema';
import { LoginFormData } from '@domain/types/forms';
import { APP_ROUTES } from '@shared/constants/appRoutes';
import { useAuth } from '@ui/hooks/useAuth';
import { useForm } from '@ui/hooks/useForm';

const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const validate = useCallback(
    (values: LoginPayload) => {
      const errors: Partial<LoginPayload> = {};
      if (!values.email) {
        errors.email = t('errors.email.required');
      } else if (!validateEmail(values.email)) {
        errors.email = t('errors.email.invalid');
      }
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
    useForm<LoginFormData>({
      initialValues: {
        email: '',
        password: '',
      },
      validate,
      onSubmit: async (payload: LoginPayload) => {
        await login(payload);
      },
    });

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
          aria-invalid={touched.email && !!errors.email}
          aria-required="true"
          required
          aria-errormessage="login-form-email-error"
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
            required
            aria-errormessage="login-form-password-error"
            data-testid="login-form-password-input"
          />
          <Button
            variant="outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={t('login.toggle_password')}
            tabIndex={-1}
            data-testid="login-form-password-toggle">
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </Button>
        </InputGroup>
        <Form.Text className="text-muted" data-testid="login-form-password-help">
          {t('login.password_help')}
        </Form.Text>
        <Form.Control.Feedback type="invalid" data-testid="login-form-password-error">
          {errors.password}
        </Form.Control.Feedback>
      </Form.Group>

      <div className="d-grid">
        <Button
          variant="outline-theme"
          size="lg"
          className="d-block w-100 fw-500 mb-3"
          type="submit"
          disabled={isSubmitting || loading}
          aria-busy={isSubmitting || loading}
          data-testid="login-form-button">
          {isSubmitting || loading ? t('global.accessing') : t('login.button')}
        </Button>
      </div>
      <div className="text-center text-inverse text-opacity-50">
        {t('login.no_account')} <Link to={APP_ROUTES.REGISTER}>{t('login.sign_up')}</Link>{' '}
        {t('login.no_account_suffix')}
      </div>
    </Form>
  );
};

export default LoginForm;
