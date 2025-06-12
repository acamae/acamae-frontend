import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import { IPromiseMock, promiseMock } from '@shared/utils/apiTestUtils';
import ForgotPasswordForm from '@ui/components/Forms/ForgotPasswordForm';
import { useAuth } from '@ui/hooks/useAuth';
import { useToast } from '@ui/hooks/useToast';

// Mock de las dependencias
jest.mock('@ui/hooks/useAuth');
jest.mock('@ui/hooks/useToast');
jest.mock('react-i18next');

const toastMock = { error: jest.fn(), success: jest.fn() };

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
      fireEvent.submit(screen.getByTestId('forgot-password-form'));
    });

    await waitFor(() => {
      expect(forgotPasswordMock).toHaveBeenCalledWith({ email: 'test@mail.com' });
      expect(screen.getByTestId('forgot-password-form-email-error')).toBeEmptyDOMElement();
      expect(toastMock.success).toHaveBeenCalledWith('forgot.success', 'forgot.check_email');
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
      fireEvent.submit(screen.getByTestId('forgot-password-form'));
    });

    await waitFor(() => {
      expect(forgotPasswordMock).toHaveBeenCalledWith({ email: 'test@mail.com' });
      expect(screen.getByTestId('forgot-password-form-email-error')).toBeEmptyDOMElement();
      expect(toastMock.success).not.toHaveBeenCalled();
      expect(toastMock.error).toHaveBeenCalledWith('forgot.failed', 'error.email.not_found');
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
});
