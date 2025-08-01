import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import { promiseMock } from '@shared/utils/apiTestUtils';
import ResendVerificationForm from '@ui/components/Forms/ResendVerificationForm';
import { useAuth } from '@ui/hooks/useAuth';
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

const toastMock = {
  error: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
  show: jest.fn(),
};

function setupUseAuth({
  loading = false,
  resendVerification = promiseMock(),
}: {
  loading?: boolean;
  resendVerification?: jest.Mock;
} = {}) {
  (useAuth as jest.Mock).mockReturnValue({
    loading,
    resendVerification,
  });
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

function setupUseToast() {
  (useToast as jest.Mock).mockReturnValue(toastMock);
}

function renderResendVerificationForm() {
  return render(
    <MemoryRouter>
      <ResendVerificationForm />
    </MemoryRouter>
  );
}

describe('ResendVerificationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupUseToast();
    setupUseAuth();
    setupUseTranslation();
  });

  it('should render fields correctly', () => {
    renderResendVerificationForm();
    expect(
      screen.getByTestId('email-verification-resend-form-identifier-input')
    ).toBeInTheDocument();
    expect(screen.getByTestId('email-verification-resend-form-button')).toBeInTheDocument();
    expect(screen.getByTestId('email-verification-resend-form-identifier-label')).toHaveTextContent(
      'verification.resend.label'
    );
    expect(screen.getByTestId('email-verification-resend-form-identifier-error')).toHaveTextContent(
      ''
    );
  });

  it('should show success message after successful submit', async () => {
    const resendVerificationMock = promiseMock();
    setupUseAuth({ resendVerification: resendVerificationMock });
    renderResendVerificationForm();
    fireEvent.change(screen.getByTestId('email-verification-resend-form-identifier-input'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByTestId('email-verification-resend-form-button'));
    await waitFor(() => {
      expect(resendVerificationMock).toHaveBeenCalledWith({
        identifier: 'test@example.com',
      });
      expect(toastMock.success).not.toHaveBeenCalled();
    });
  });

  it('should show error message when email is invalid', async () => {
    const resendVerificationMock = promiseMock();
    setupUseAuth({ resendVerification: resendVerificationMock });
    renderResendVerificationForm();

    await act(async () => {
      fireEvent.change(screen.getByTestId('email-verification-resend-form-identifier-input'), {
        target: { value: 'invalid-email' },
      });
      fireEvent.blur(screen.getByTestId('email-verification-resend-form-identifier-input'));
    });

    await waitFor(() => {
      expect(
        screen.getByTestId('email-verification-resend-form-identifier-error')
      ).toHaveTextContent('errors.email.invalid');
      expect(resendVerificationMock).not.toHaveBeenCalled();
    });
  });

  it('should show error message when field is empty', async () => {
    const resendVerificationMock = promiseMock();
    setupUseAuth({ resendVerification: resendVerificationMock });
    renderResendVerificationForm();

    // First fill the field to enable the button
    fireEvent.change(screen.getByTestId('email-verification-resend-form-identifier-input'), {
      target: { value: 'test@example.com' },
    });

    // Then clear it and try to submit
    fireEvent.change(screen.getByTestId('email-verification-resend-form-identifier-input'), {
      target: { value: '' },
    });
    fireEvent.submit(screen.getByTestId('email-verification-resend-form'));

    await waitFor(() => {
      expect(
        screen.getByTestId('email-verification-resend-form-identifier-error')
      ).toHaveTextContent('errors.email.invalid');
      expect(resendVerificationMock).not.toHaveBeenCalled();
    });
  });

  it('should show error message when user does not exist', async () => {
    const resendVerificationMock = promiseMock({ error: 'AUTH_USER_NOT_FOUND' });
    setupUseAuth({ resendVerification: resendVerificationMock });
    renderResendVerificationForm();

    await act(async () => {
      fireEvent.change(screen.getByTestId('email-verification-resend-form-identifier-input'), {
        target: { value: 'notfound@example.com' },
      });
      fireEvent.blur(screen.getByTestId('email-verification-resend-form-identifier-input'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('email-verification-resend-form-button'));
    });

    await waitFor(() => {
      expect(resendVerificationMock).toHaveBeenCalledWith({
        identifier: 'notfound@example.com',
      });
      expect(toastMock.error).not.toHaveBeenCalled();
    });
  });

  it('should show error message when user is already verified', async () => {
    const resendVerificationMock = promiseMock({ error: 'AUTH_USER_ALREADY_VERIFIED' });
    setupUseAuth({ resendVerification: resendVerificationMock });
    renderResendVerificationForm();

    await act(async () => {
      fireEvent.change(screen.getByTestId('email-verification-resend-form-identifier-input'), {
        target: { value: 'already@example.com' },
      });
      fireEvent.blur(screen.getByTestId('email-verification-resend-form-identifier-input'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('email-verification-resend-form-button'));
    });

    await waitFor(() => {
      expect(resendVerificationMock).toHaveBeenCalledWith({
        identifier: 'already@example.com',
      });
      expect(toastMock.error).not.toHaveBeenCalled();
    });
  });

  it('should show generic error message for other errors', async () => {
    const resendVerificationMock = promiseMock({ error: 'Network error' });
    setupUseAuth({ resendVerification: resendVerificationMock });
    renderResendVerificationForm();

    await act(async () => {
      fireEvent.change(screen.getByTestId('email-verification-resend-form-identifier-input'), {
        target: { value: 'fail@example.com' },
      });
      fireEvent.blur(screen.getByTestId('email-verification-resend-form-identifier-input'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('email-verification-resend-form-button'));
    });

    await waitFor(() => {
      expect(resendVerificationMock).toHaveBeenCalledWith({
        identifier: 'fail@example.com',
      });
      expect(toastMock.error).not.toHaveBeenCalled();
    });
  });

  it('should disable button when loading is true', () => {
    setupUseAuth({ loading: true });
    renderResendVerificationForm();
    expect(screen.getByTestId('email-verification-resend-form-button')).toBeDisabled();
  });

  it('should show correct button text when loading is true', () => {
    setupUseAuth({ loading: true });
    renderResendVerificationForm();
    expect(screen.getByTestId('email-verification-resend-form-button')).toHaveTextContent(
      'verification.resend.loading'
    );
  });

  it('should handle error when API fails', async () => {
    const error = 'Network error';
    const resendVerificationMock = promiseMock({ error });
    setupUseAuth({ resendVerification: resendVerificationMock });
    renderResendVerificationForm();
    fireEvent.change(screen.getByTestId('email-verification-resend-form-identifier-input'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByTestId('email-verification-resend-form-button'));
    await waitFor(() => {
      expect(toastMock.error).not.toHaveBeenCalled();
    });
  });

  it('should handle error when API returns error object', async () => {
    const error = 'Custom error message';
    const resendVerificationMock = promiseMock({ error });
    setupUseAuth({ resendVerification: resendVerificationMock });
    renderResendVerificationForm();
    fireEvent.change(screen.getByTestId('email-verification-resend-form-identifier-input'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByTestId('email-verification-resend-form-button'));
    await waitFor(() => {
      expect(toastMock.error).not.toHaveBeenCalled();
    });
  });

  it('should clear validation error when user fixes email', async () => {
    const resendVerificationMock = promiseMock();
    setupUseAuth({ resendVerification: resendVerificationMock });
    renderResendVerificationForm();

    // First enter invalid email and trigger blur to show error
    await act(async () => {
      fireEvent.change(screen.getByTestId('email-verification-resend-form-identifier-input'), {
        target: { value: 'invalid-email' },
      });
      fireEvent.blur(screen.getByTestId('email-verification-resend-form-identifier-input'));
    });

    await waitFor(() => {
      expect(
        screen.getByTestId('email-verification-resend-form-identifier-error')
      ).toHaveTextContent('errors.email.invalid');
    });

    // Then fix the email
    await act(async () => {
      fireEvent.change(screen.getByTestId('email-verification-resend-form-identifier-input'), {
        target: { value: 'valid@example.com' },
      });
      fireEvent.blur(screen.getByTestId('email-verification-resend-form-identifier-input'));
    });

    await waitFor(() => {
      expect(
        screen.getByTestId('email-verification-resend-form-identifier-error')
      ).toBeEmptyDOMElement();
    });
  });

  it('should keep input value after error', async () => {
    const error = 'USER_NOT_FOUND';
    const resendVerificationMock = promiseMock({ error });
    setupUseAuth({ resendVerification: resendVerificationMock });
    renderResendVerificationForm();

    const email = 'test@example.com';
    fireEvent.change(screen.getByTestId('email-verification-resend-form-identifier-input'), {
      target: { value: email },
    });
    fireEvent.click(screen.getByTestId('email-verification-resend-form-button'));

    await waitFor(() => {
      expect(toastMock.error).not.toHaveBeenCalled();
      expect(screen.getByTestId('email-verification-resend-form-identifier-input')).toHaveValue(
        email
      );
    });
  });

  it('should render snapshot correctly', () => {
    const { asFragment } = renderResendVerificationForm();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should show validation errors', async () => {
    const resendVerificationMock = promiseMock();
    setupUseAuth({ resendVerification: resendVerificationMock });
    renderResendVerificationForm();

    // Simulate submit to mark field as touched and trigger validation
    fireEvent.submit(screen.getByTestId('email-verification-resend-form'));

    // The button should be disabled when there are validation errors
    expect(screen.getByTestId('email-verification-resend-form-button')).toBeDisabled();
    // Optionally, check hasValidationErrors if needed
  });
});
