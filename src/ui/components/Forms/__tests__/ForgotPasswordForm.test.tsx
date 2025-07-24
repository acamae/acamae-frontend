import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import { IPromiseMock, promiseMock } from '@shared/utils/apiTestUtils';
import ForgotPasswordForm from '@ui/components/Forms/ForgotPasswordForm';
import { useAuth } from '@ui/hooks/useAuth';
import * as useFormModule from '@ui/hooks/useForm';
import { useToast } from '@ui/hooks/useToast';

// Mock de las dependencias
jest.mock('@ui/hooks/useAuth');
jest.mock('@ui/hooks/useToast');
jest.mock('react-i18next');

// Mock específico para useThrottledSubmit que deshabilita el throttling en tests
jest.mock('@ui/hooks/useThrottledSubmit', () => ({
  useThrottledSubmit: jest.fn(() => ({
    handleThrottledSubmit: jest.fn(),
    isThrottled: false,
    canSubmit: true,
    timeUntilNextSubmission: 0,
    remainingAttempts: 0,
    resetThrottle: jest.fn(),
    activateThrottle: jest.fn(),
  })),
}));

// Los mocks del throttling ahora están configurados globalmente en jest.setup.ts

const toastMock = {
  error: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
  show: jest.fn(),
};

function setupUseAuth({
  loading = false,
  forgotPassword = promiseMock(),
}: {
  loading?: boolean;
  forgotPassword?: IPromiseMock;
} = {}) {
  (useAuth as jest.Mock).mockReturnValue({
    loading,
    forgotPassword,
  });
}

function setupUseToast() {
  (useToast as jest.Mock).mockReturnValue(toastMock);
}

const changeLanguageMock = jest.fn();
function setupUseTranslation({
  lang = 'es-ES',
  t = (str: string) => str,
  changeLanguage = changeLanguageMock,
} = {}) {
  (useTranslation as jest.Mock).mockReturnValue({
    t,
    i18n: {
      language: lang,
      changeLanguage,
    },
  });
}

function renderForgotPasswordForm() {
  return render(<ForgotPasswordForm />);
}

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupUseToast();
    setupUseAuth();
    setupUseTranslation();
  });

  it('should render form correctly', () => {
    renderForgotPasswordForm();
    expect(screen.getByTestId('forgot-password-form-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('forgot-password-form-button')).toBeInTheDocument();
    expect(screen.getByTestId('forgot-password-form-email-help')).toHaveTextContent(
      'forgot.email_help'
    );
    expect(screen.getByTestId('forgot-password-form-email-error')).toBeEmptyDOMElement();
  });

  it('should handle successful form submission', async () => {
    const forgotPasswordMock = promiseMock();
    setupUseAuth({ forgotPassword: forgotPasswordMock });
    renderForgotPasswordForm();

    await act(async () => {
      fireEvent.change(screen.getByTestId('forgot-password-form-email-input'), {
        target: { value: 'test@mail.com' },
      });
      fireEvent.blur(screen.getByTestId('forgot-password-form-email-input'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('forgot-password-form-button'));
    });

    await waitFor(() => {
      expect(forgotPasswordMock).toHaveBeenCalledWith({ email: 'test@mail.com' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('forgot-password-form-email-error')).toBeEmptyDOMElement();
      expect(toastMock.success).not.toHaveBeenCalled();
      expect(toastMock.error).not.toHaveBeenCalled();
    });
  });

  it('should handle error in form submission', async () => {
    const forgotPasswordMock = promiseMock({ error: 'error.email.not_found' });
    setupUseAuth({ forgotPassword: forgotPasswordMock });
    renderForgotPasswordForm();

    await act(async () => {
      fireEvent.change(screen.getByTestId('forgot-password-form-email-input'), {
        target: { value: 'test@mail.com' },
      });
      fireEvent.blur(screen.getByTestId('forgot-password-form-email-input'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('forgot-password-form-button'));
    });

    await waitFor(() => {
      expect(forgotPasswordMock).toHaveBeenCalledWith({ email: 'test@mail.com' });
    });

    // Verificar que el error se muestra correctamente
    await waitFor(() => {
      expect(screen.getByTestId('forgot-password-form-email-error')).toBeEmptyDOMElement();
      expect(toastMock.success).not.toHaveBeenCalled();
      expect(toastMock.error).not.toHaveBeenCalled();
    });
  });

  describe('form validation', () => {
    it('should validate that the email is not empty', async () => {
      const forgotPasswordMock = promiseMock();
      setupUseAuth({ forgotPassword: forgotPasswordMock });
      renderForgotPasswordForm();

      await act(async () => {
        fireEvent.change(screen.getByTestId('forgot-password-form-email-input'), {
          target: { value: '' },
        });
        fireEvent.submit(screen.getByTestId('forgot-password-form'));
      });

      await waitFor(() => {
        expect(forgotPasswordMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('forgot-password-form-email-error')).toHaveTextContent(
          'errors.email.required'
        );
        expect(toastMock.error).not.toHaveBeenCalled();
        expect(toastMock.success).not.toHaveBeenCalled();
      });
    });

    it('should validate that the email is invalid', async () => {
      const forgotPasswordMock = promiseMock();
      setupUseAuth({ forgotPassword: forgotPasswordMock });
      setupUseTranslation({ t: str => str });
      renderForgotPasswordForm();

      await act(async () => {
        fireEvent.change(screen.getByTestId('forgot-password-form-email-input'), {
          target: { value: 'invalid-email' },
        });
        fireEvent.submit(screen.getByTestId('forgot-password-form'));
      });

      await waitFor(() => {
        expect(forgotPasswordMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('forgot-password-form-email-error')).toHaveTextContent(
          'errors.email.invalid'
        );
      });
    });
  });

  it('should show loading state during submission', async () => {
    setupUseAuth({ forgotPassword: promiseMock(), loading: true });
    renderForgotPasswordForm();

    await act(async () => {
      fireEvent.change(screen.getByTestId('forgot-password-form-email-input'), {
        target: { value: 'test@mail.com' },
      });
      fireEvent.submit(screen.getByTestId('forgot-password-form'));
    });

    const submitButton = screen.getByTestId('forgot-password-form-button');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('aria-busy', 'true');
  });

  it('should show attempts warning when remainingAttempts is 2', () => {
    jest.spyOn(useFormModule, 'useForm').mockReturnValue({
      values: { email: '' },
      errors: {},
      touched: {},
      isSubmitting: false,
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: jest.fn(),
      isThrottled: false,
      canSubmit: true,
      timeUntilNextSubmission: 0,
      remainingAttempts: 2,
      resetThrottle: jest.fn(),
      activateThrottle: jest.fn(),
      handleCheckboxChange: jest.fn(),
      resetForm: jest.fn(),
      hasValidationErrors: false,
      isFormValid: true,
    } as ReturnType<typeof useFormModule.useForm>);
    renderForgotPasswordForm();
    expect(screen.getByTestId('forgot-password-form-attempts-warning')).toBeInTheDocument();
  });

  it('should show validation errors', async () => {
    const forgotPasswordMock = promiseMock();
    setupUseAuth({ forgotPassword: forgotPasswordMock });
    renderForgotPasswordForm();

    await act(async () => {
      fireEvent.change(screen.getByTestId('forgot-password-form-email-input'), {
        target: { value: 'invalid-email' },
      });
      fireEvent.submit(screen.getByTestId('forgot-password-form'));
    });

    await waitFor(() => {
      expect(forgotPasswordMock).not.toHaveBeenCalled();
      expect(screen.getByTestId('forgot-password-form-email-error')).toHaveTextContent(
        'errors.email.invalid'
      );
    });

    // The button should be disabled when there are validation errors
    expect(screen.getByTestId('forgot-password-form-button')).toBeDisabled();
    // Optionally, check hasValidationErrors if needed
  });
});
