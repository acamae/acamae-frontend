import { useState, useCallback } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';

import {
  validateEmail,
  validatePassword,
  validateUsername,
} from '@domain/services/validationService';
import { RegisterPayload } from '@domain/types/apiSchema';
import { RegisterFormData } from '@domain/types/forms';
import PasswordStrengthMeter from '@ui/components/PasswordStrengthMeter';
import { useAuth } from '@ui/hooks/useAuth';
import { useForm } from '@ui/hooks/useForm';

import TCOffcanvas from '../Offcanvas/TCOffcanvas';

const RegisterForm: React.FC = () => {
  const { t } = useTranslation();
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
    isThrottled,
    canSubmit,
    timeUntilNextSubmission,
    remainingAttempts,
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
      await register(data);
    },
    enableThrottling: true,
    formName: 'register-form',
  });

  const getButtonText = () => {
    if (loading || isSubmitting) {
      return t('global.processing');
    }
    if (isThrottled && timeUntilNextSubmission && timeUntilNextSubmission > 0) {
      return `${t('register.button')} (${Math.ceil(timeUntilNextSubmission / 1000)}s)`;
    }
    return t('register.button');
  };

  const showAttemptsWarning =
    remainingAttempts !== undefined && remainingAttempts > 0 && remainingAttempts <= 2;

  return (
    <>
      <p className="text-muted">
        <Trans
          i18nKey="global.required_asterisk"
          components={{
            abbr: <abbr className="text-danger" title={t('global.required')} />,
          }}
        />
      </p>
      <Form
        onSubmit={e => {
          void handleSubmit(e);
        }}
        noValidate
        data-testid="register-form">
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>
            {t('register.email')}{' '}
            <abbr className="text-danger" title={t('global.required')}>
              *
            </abbr>
          </Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            isInvalid={touched.email && !!errors.email}
            aria-invalid={touched.email && !!errors.email}
            required
            aria-required="true"
            autoComplete="email"
            aria-describedby="emailHelp"
            aria-errormessage="register-form-email-error"
            data-testid="register-form-email-input"
          />
          <Form.Text id="emailHelp" className="text-muted">
            {t('register.email_help')}
          </Form.Text>
          <Form.Control.Feedback
            type="invalid"
            data-testid="register-form-email-error"
            aria-live="polite"
            aria-atomic="true"
            role="alert">
            {errors.email}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="username">
          <Form.Label>
            {t('register.username')}{' '}
            <abbr className="text-danger" title={t('global.required')}>
              *
            </abbr>
          </Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={values.username}
            onChange={handleChange}
            isInvalid={touched.username && !!errors.username}
            aria-invalid={touched.username && !!errors.username}
            required
            aria-required="true"
            autoComplete="username"
            aria-describedby="usernameHelp"
            aria-errormessage="register-form-username-error"
            data-testid="register-form-username-input"
          />
          <Form.Text id="usernameHelp" className="text-muted">
            {t('register.username_help')}
          </Form.Text>
          <Form.Control.Feedback
            type="invalid"
            data-testid="register-form-username-error"
            aria-live="polite"
            aria-atomic="true"
            role="alert">
            {errors.username}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>
            {t('register.password')}{' '}
            <abbr className="text-danger" title={t('global.required')}>
              *
            </abbr>
          </Form.Label>
          <InputGroup
            hasValidation
            className={touched.password && !!errors.password ? 'is-invalid' : ''}>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={values.password}
              onChange={handleChange}
              isInvalid={touched.password && !!errors.password}
              aria-invalid={touched.password && !!errors.password}
              required
              aria-required="true"
              autoComplete="new-password"
              aria-describedby="passwordHelp"
              aria-errormessage="register-form-password-error"
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
          </InputGroup>
          <Form.Text id="passwordHelp" className="text-muted">
            {t('register.password_help')}
          </Form.Text>
          <Form.Control.Feedback
            type="invalid"
            data-testid="register-form-password-error"
            aria-live="polite"
            aria-atomic="true"
            role="alert">
            {errors.password}
          </Form.Control.Feedback>
          <PasswordStrengthMeter password={values.password ?? ''} t={t} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>
            {t('register.confirm_password')}{' '}
            <abbr className="text-danger" title={t('global.required')}>
              *
            </abbr>
          </Form.Label>
          <InputGroup
            hasValidation
            className={touched.confirmPassword && !!errors.confirmPassword ? 'is-invalid' : ''}>
            <Form.Control
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              isInvalid={touched.confirmPassword && !!errors.confirmPassword}
              aria-invalid={touched.confirmPassword && !!errors.confirmPassword}
              required
              aria-required="true"
              autoComplete="new-password"
              aria-describedby="confirmPasswordHelp"
              aria-errormessage="register-form-confirm-password-error"
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
          </InputGroup>
          <Form.Text id="confirmPasswordHelp" className="text-muted">
            {t('register.confirm_password_help')}
          </Form.Text>
          <Form.Control.Feedback
            type="invalid"
            data-testid="register-form-confirm-password-error"
            aria-live="polite"
            aria-atomic="true"
            role="alert">
            {errors.confirmPassword}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3 has-validation" controlId="terms">
          <Form.Check
            type="checkbox"
            label={
              <>
                <Trans
                  i18nKey="register.terms_and_conditions"
                  components={{ url: <a href="#" onClick={handleShow} /> }} // NOSONAR: This is valid
                />{' '}
                <abbr className="text-danger" title={t('global.required')}>
                  *
                </abbr>
              </>
            }
            id="terms"
            name="terms"
            onChange={handleCheckboxChange}
            className={touched.terms && !!errors.terms ? 'is-invalid' : ''}
            isInvalid={touched.terms && !!errors.terms}
            aria-invalid={touched.terms && !!errors.terms}
            required
            aria-required="true"
            autoComplete="terms"
            aria-describedby="termsHelp"
            aria-errormessage="register-form-terms-error"
            data-testid="register-form-terms-checkbox"
          />
          <Form.Text id="termsHelp" className="text-muted sr-only">
            {t('register.terms_and_conditions_help')}{' '}
          </Form.Text>
          <Form.Control.Feedback
            type="invalid"
            data-testid="register-form-terms-error"
            aria-live="polite"
            aria-atomic="true"
            role="alert">
            {errors.terms}
          </Form.Control.Feedback>
        </Form.Group>

        {showAttemptsWarning && (
          <div
            className="alert alert-warning mb-3"
            role="alert"
            data-testid="register-form-attempts-warning">
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
            disabled={loading || isSubmitting || isThrottled || !canSubmit}
            aria-busy={loading || isSubmitting}
            data-testid="register-form-button">
            {getButtonText()}
          </Button>
        </div>
      </Form>

      <TCOffcanvas show={showTCOffcanvas} onHide={handleClose} />
    </>
  );
};

export default RegisterForm;
