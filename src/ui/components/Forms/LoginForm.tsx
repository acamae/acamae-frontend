import { useState, useCallback } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { validateEmail, validatePassword } from '@domain/services/validationService';
import { LoginPayload, ApiErrorResponse } from '@domain/types/apiSchema';
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
    activateThrottle,
  } = useForm<LoginFormData>({
    initialValues: {
      email: '',
      password: '',
    },
    validate,
    onSubmit: async (data: LoginPayload) => {
      try {
        const result = await login(data);

        // Check if the result contains an error
        if (result && 'error' in result && result.error) {
          const error = result.error as ApiErrorResponse<unknown>;

          // Check if it's a throttling error from the server
          if (error?.status === 429 || error?.code === 'AUTH_RATE_LIMIT') {
            // Activate client-side throttling when server returns throttling error
            if (activateThrottle) {
              activateThrottle();
            }
            console.log('Server throttling detected, activating client-side throttling');
            return; // Don't proceed with normal error handling
          }
        }
      } catch (error: unknown) {
        // Handle any other errors
        console.error('Login error:', error);

        // Check if it's a throttling error from the server
        if (
          error &&
          typeof error === 'object' &&
          'status' in error &&
          (error as { status: unknown }).status === 429
        ) {
          // Activate client-side throttling when server returns throttling error
          if (activateThrottle) {
            activateThrottle();
          }
          console.log('Server throttling detected, activating client-side throttling');
          return; // Don't proceed with normal error handling
        }
      }
    },
    enableThrottling: true,
    formName: 'login-form',
  });

  const getButtonText = () => {
    if (isSubmitting || loading) {
      return t('global.accessing');
    }
    if (isThrottled && timeUntilNextSubmission && timeUntilNextSubmission > 0) {
      return `${t('login.button')} (${Math.ceil(timeUntilNextSubmission / 1000)}s)`;
    }
    return t('login.button');
  };

  const showAttemptsWarning = remainingAttempts > 0 && remainingAttempts <= 2;

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
          onBlur={handleBlur}
          isInvalid={touched.email && !!errors.email}
          aria-invalid={touched.email && !!errors.email ? 'true' : 'false'}
          aria-required="true"
          required
          aria-errormessage="login-form-email-error"
          data-testid="login-form-email-input"
        />
        <Form.Control.Feedback
          type="invalid"
          aria-live="polite"
          aria-atomic="true"
          role="alert"
          data-testid="login-form-email-error">
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
            onBlur={handleBlur}
            isInvalid={touched.password && !!errors.password}
            aria-invalid={touched.password && !!errors.password ? 'true' : 'false'}
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
            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
          </Button>
        </InputGroup>
        <Form.Control.Feedback
          type="invalid"
          aria-live="polite"
          aria-atomic="true"
          role="alert"
          data-testid="login-form-password-error">
          {errors.password}
        </Form.Control.Feedback>
      </Form.Group>

      {showAttemptsWarning && (
        <div
          className="alert alert-warning mb-3"
          role="alert"
          data-testid="login-form-attempts-warning">
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
          data-testid="login-form-button">
          {getButtonText()}
        </Button>
      </div>
      <div className="text-center text-inverse text-opacity-50">
        {t('login.no_account')} <Link to={APP_ROUTES.REGISTER}>{t('login.sign_up')}</Link>{' '}
        {t('login.no_account_suffix')}
      </div>
      <div className="text-center text-inverse text-opacity-50 mt-3">
        <Link to={APP_ROUTES.FORGOT_PASSWORD}>{t('login.forgot')}</Link>
      </div>
    </Form>
  );
};

export default LoginForm;
