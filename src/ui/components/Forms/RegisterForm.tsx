import { useState, useCallback, useEffect } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  validateEmail,
  validatePassword,
  validateUsername,
} from '@domain/services/validationService';
import PasswordStrengthMeter from '@ui/components/Forms/PasswordStrengthMeter';
import { useAuth } from '@ui/hooks/useAuth';
import { useForm } from '@ui/hooks/useForm';
import { useToast } from '@ui/hooks/useToast';

interface RegisterFormProps {
  redirectTo?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  redirectTo = '/login?registrationSuccess=true',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { register, loading, error } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { values, errors, touched, handleChange, handleSubmit, isSubmitting } = useForm<{
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }>({
    initialValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },

    validate: useCallback(
      (values: { email: string; username: string; password: string; confirmPassword: string }) => {
        const errors: Partial<{
          email: string;
          username: string;
          password: string;
          confirmPassword: string;
        }> = {};
        if (!validateEmail(values.email)) {
          errors.email = t('errors.email.invalid');
        }
        if (!validateUsername(values.username)) {
          errors.username = t('errors.username.invalid');
        }
        if (!validatePassword(values.password)) {
          errors.password = t('errors.password.invalid');
        }
        if (!values.confirmPassword) {
          errors.confirmPassword = t('errors.password.confirm_required');
        } else if (values.password !== values.confirmPassword) {
          errors.confirmPassword = t('errors.password.mismatch');
        }
        return errors;
      },
      [t]
    ),

    onSubmit: async () => {
      try {
        await register({
          email: values.email,
          password: values.password,
          username: values.username,
        });
        toast.success(t('register.success'), t('register.welcome'));
        navigate(redirectTo);
      } catch (err: unknown) {
        const errorMessage =
          typeof err === 'string'
            ? err
            : (err as { message?: string })?.message || t('register.failed');
        toast.error(errorMessage, t('register.failed'));
      }
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error, t('register.failed'));
    }
  }, [error, t, toast]);

  return (
    <Form onSubmit={handleSubmit} noValidate data-testid="register-form">
      <Form.Group className="mb-3" controlId="email">
        <Form.Label>{t('register.email')}</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          isInvalid={touched.email && !!errors.email}
          required
          autoComplete="email"
          aria-describedby="emailHelp"
          data-testid="register-form-email-input"
        />
        <Form.Text id="emailHelp" className="text-muted">
          {t('register.email_help')}
        </Form.Text>
        <Form.Control.Feedback type="invalid" data-testid="register-form-email-error">
          {errors.email}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="username">
        <Form.Label>{t('register.username')}</Form.Label>
        <Form.Control
          type="text"
          name="username"
          value={values.username}
          onChange={handleChange}
          isInvalid={touched.username && !!errors.username}
          required
          autoComplete="username"
          aria-describedby="usernameHelp"
          data-testid="register-form-username-input"
        />
        <Form.Text id="usernameHelp" className="text-muted">
          {t('register.username_help')}
        </Form.Text>
        <Form.Control.Feedback type="invalid" data-testid="register-form-username-error">
          {errors.username}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="password">
        <Form.Label>{t('register.password')}</Form.Label>
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
            data-testid="register-form-password-input"
          />
          <Button
            variant="outline-secondary"
            onClick={() => setShowPassword(prev => !prev)}
            aria-label={t('register.toggle_password')}
            data-testid="btn-toggle-password"
            type="button">
            {showPassword ? '🙈' : '👁️'}
          </Button>
          <Form.Control.Feedback type="invalid" data-testid="register-form-password-error">
            {errors.password}
          </Form.Control.Feedback>
        </InputGroup>
        <Form.Text id="passwordHelp" className="text-muted">
          {t('register.password_help')}
        </Form.Text>
        <PasswordStrengthMeter password={values.password} t={t} />
      </Form.Group>

      <Form.Group className="mb-3" controlId="confirmPassword">
        <Form.Label>{t('register.confirm_password')}</Form.Label>
        <InputGroup hasValidation>
          <Form.Control
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange}
            isInvalid={touched.confirmPassword && !!errors.confirmPassword}
            required
            autoComplete="new-password"
            aria-describedby="confirmPasswordHelp"
            data-testid="register-form-confirm-password-input"
          />
          <Button
            variant="outline-secondary"
            onClick={() => setShowConfirmPassword(prev => !prev)}
            aria-label={t('register.toggle_password')}
            data-testid="btn-toggle-confirm-password"
            type="button">
            {showConfirmPassword ? '🙈' : '👁️'}
          </Button>
          <Form.Control.Feedback type="invalid" data-testid="register-form-confirm-password-error">
            {errors.confirmPassword}
          </Form.Control.Feedback>
        </InputGroup>
        <Form.Text id="confirmPasswordHelp" className="text-muted">
          {t('register.confirm_password_help')}
        </Form.Text>
      </Form.Group>

      <div className="d-grid">
        <Button
          variant="primary"
          type="submit"
          disabled={loading || isSubmitting}
          data-testid="register-form-button">
          {loading || isSubmitting ? t('register.accessing') : t('register.button')}
        </Button>
      </div>
    </Form>
  );
};

export default RegisterForm;
