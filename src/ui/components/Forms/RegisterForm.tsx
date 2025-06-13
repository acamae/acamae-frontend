import { useState, useCallback } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  validateEmail,
  validatePassword,
  validateUsername,
} from '@domain/services/validationService';
import { RegisterPayload } from '@domain/types/apiSchema';
import { RegisterFormData } from '@domain/types/forms';
import { APP_ROUTES } from '@shared/constants/appRoutes';
import PasswordStrengthMeter from '@ui/components/PasswordStrengthMeter';
import { useAuth } from '@ui/hooks/useAuth';
import { useForm } from '@ui/hooks/useForm';
import { useToast } from '@ui/hooks/useToast';

import TCOffcanvas from '../Offcanvas/TCOffcanvas';

const RegisterForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { register, loading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTCOffcanvas, setShowTCOffcanvas] = useState(false);

  const handleClose = () => setShowTCOffcanvas(false);
  const handleShow = () => {
    setShowTCOffcanvas(true);
    return false;
  };

  const validate = useCallback(
    (values: RegisterFormData) => {
      const errors: Partial<Record<keyof RegisterFormData, string>> = {};
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
      if (!values.terms) {
        errors.terms = t('errors.terms.required');
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
    handleSubmit,
    isSubmitting,
    handleCheckboxChange,
  } = useForm<RegisterFormData>({
    initialValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
    validate,
    onSubmit: async (data: RegisterPayload) => {
      try {
        await register(data);
        toast.success(t('register.success'), t('register.welcome'));
        navigate(APP_ROUTES.LOGIN);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message, t('register.failed'));
        } else {
          toast.error(t('register.failed'));
        }
      }
    },
  });

  return (
    <>
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
          <PasswordStrengthMeter password={values.password ?? ''} t={t} />
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
            <Form.Control.Feedback
              type="invalid"
              data-testid="register-form-confirm-password-error">
              {errors.confirmPassword}
            </Form.Control.Feedback>
          </InputGroup>
          <Form.Text id="confirmPasswordHelp" className="text-muted">
            {t('register.confirm_password_help')}
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3 has-validation" controlId="terms">
          <Form.Check
            type="checkbox"
            label={
              <Trans
                i18nKey="register.terms_and_conditions"
                components={{ url: <a href="#" onClick={handleShow} /> }}
              />
            }
            id="terms"
            name="terms"
            onChange={handleCheckboxChange}
            className={touched.terms && !!errors.terms ? 'is-invalid' : ''}
            isInvalid={touched.terms && !!errors.terms}
            required
            autoComplete="terms"
            aria-describedby="termsHelp"
            data-testid="register-form-terms-checkbox"
          />
          <Form.Text id="termsHelp" className="text-muted sr-only">
            {t('register.terms_and_conditions_help')}{' '}
          </Form.Text>
          <Form.Control.Feedback type="invalid" data-testid="register-form-terms-error">
            {errors.terms}
          </Form.Control.Feedback>
        </Form.Group>

        <div className="d-grid">
          <Button
            size="lg"
            variant="outline-theme"
            className="d-block w-100 fw-500 mb-3"
            type="submit"
            disabled={loading || isSubmitting}
            data-testid="register-form-button">
            {loading || isSubmitting ? t('global.accessing') : t('register.button')}
          </Button>
        </div>
      </Form>

      <TCOffcanvas show={showTCOffcanvas} onHide={handleClose} />
    </>
  );
};

export default RegisterForm;
