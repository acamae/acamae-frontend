import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import { IPromiseMock, promiseMock } from '@shared/utils/apiTestUtils';
import ResetPasswordForm from '@ui/components/Forms/ResetPasswordForm';
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

// Mock específico para zxcvbn
jest.mock('zxcvbn', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    score: 2,
    feedback: {
      warning: '',
      suggestions: [],
    },
  })),
}));

// Mock TCOffcanvas component
jest.mock('@ui/components/Offcanvas/TCOffcanvas', () => ({
  __esModule: true,
  default: () => null,
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
  resetPassword = promiseMock(),
}: {
  loading?: boolean;
  resetPassword?: IPromiseMock;
} = {}) {
  (useAuth as jest.Mock).mockReturnValue({
    loading,
    resetPassword,
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

function renderResetPasswordForm(props = { tokenProp: 'mock-token' }) {
  return render(
    <MemoryRouter>
      <ResetPasswordForm {...props} />
    </MemoryRouter>
  );
}

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupUseToast();
    setupUseAuth();
    setupUseTranslation();
  });

  it('should render correctly the fields', () => {
    renderResetPasswordForm();
    expect(screen.getByTestId('reset-password-form-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('reset-password-form-button')).toBeInTheDocument();
    expect(screen.getByTestId('reset-password-form-password-help')).toHaveTextContent(
      'register.password_help'
    );
    expect(screen.getByTestId('reset-password-form-password-error')).toBeEmptyDOMElement();
    expect(screen.getByTestId('reset-password-form-password-input')).toHaveAttribute(
      'type',
      'password'
    );
    expect(screen.getByTestId('btn-toggle-password')).toBeInTheDocument();
    expect(screen.getByTestId('btn-toggle-password').querySelector('.bi-eye')).toBeInTheDocument();
    expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
    expect(screen.getByTestId('label-reset-password')).toHaveTextContent('reset.password');
  });

  it('should render alert when there is no token', () => {
    renderResetPasswordForm({ tokenProp: '' });
    expect(screen.getByTestId('alert-error')).toHaveTextContent('reset.invalid_token');
    expect(screen.queryByTestId('reset-password-form')).not.toBeInTheDocument();
  });

  it('should show success message after successful submit', async () => {
    const resetPasswordMock = promiseMock();
    setupUseAuth({ resetPassword: resetPasswordMock });
    renderResetPasswordForm();

    await act(async () => {
      fireEvent.change(screen.getByTestId('reset-password-form-password-input'), {
        target: { value: 'Password123!' },
      });
      fireEvent.change(screen.getByTestId('reset-password-form-confirm-password-input'), {
        target: { value: 'Password123!' },
      });
      fireEvent.submit(screen.getByTestId('reset-password-form'));
    });

    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith({
        token: 'mock-token',
        password: 'Password123!',
      });
      expect(toastMock.success).not.toHaveBeenCalled();
    });
  });

  it('should show validation error when password is invalid', async () => {
    renderResetPasswordForm();

    // First fill the field to enable the button
    await act(async () => {
      fireEvent.change(screen.getByTestId('reset-password-form-password-input'), {
        target: { value: 'test' },
      });
    });

    // Then clear it and try to submit
    await act(async () => {
      fireEvent.change(screen.getByTestId('reset-password-form-password-input'), {
        target: { value: '' },
      });
      fireEvent.submit(screen.getByTestId('reset-password-form'));
    });

    expect(screen.getByText('errors.password.required')).toBeInTheDocument();
  });

  it('should show error when token is invalid', () => {
    setupUseToast();
    renderResetPasswordForm({ tokenProp: '' });
    expect(screen.getByTestId('alert-error')).toHaveTextContent('reset.invalid_token');
  });

  it('should disable submit button when loading is true', () => {
    setupUseAuth({ loading: true });
    renderResetPasswordForm();
    expect(screen.getByTestId('reset-password-form-button')).toBeDisabled();
  });

  it('should handle reset error when it is a string', async () => {
    const resetPasswordMock = promiseMock({ error: 'Invalid or expired token' });
    setupUseAuth({ resetPassword: resetPasswordMock });
    renderResetPasswordForm({ tokenProp: 'mock-token' });

    await act(async () => {
      fireEvent.change(screen.getByTestId('reset-password-form-password-input'), {
        target: { value: 'Password123!' },
      });
      fireEvent.blur(screen.getByTestId('reset-password-form-password-input'));
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId('reset-password-form-confirm-password-input'), {
        target: { value: 'Password123!' },
      });
      fireEvent.blur(screen.getByTestId('reset-password-form-confirm-password-input'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('reset-password-form-button'));
    });

    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith({
        token: 'mock-token',
        password: 'Password123!',
      });
    });

    await waitFor(() => {
      expect(toastMock.error).not.toHaveBeenCalled();
    });
  });

  it('should toggle password visibility', async () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByTestId('reset-password-form-password-input');
    const toggleButton = screen.getByTestId('btn-toggle-password');

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton.querySelector('.bi-eye')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(toggleButton.querySelector('.bi-eye-slash')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton.querySelector('.bi-eye')).toBeInTheDocument();
  });

  it('should handle error when token becomes invalid', async () => {
    const resetPasswordMock = promiseMock();
    setupUseAuth({ resetPassword: resetPasswordMock });
    const { rerender } = renderResetPasswordForm({ tokenProp: 'valid-token' });

    expect(screen.getByTestId('reset-password-form-password-input')).toBeInTheDocument();

    await act(async () => {
      rerender(
        <MemoryRouter>
          <ResetPasswordForm tokenProp="" />
        </MemoryRouter>
      );
    });

    expect(screen.getByTestId('alert-error')).toHaveTextContent('reset.invalid_token');
    expect(screen.queryByTestId('reset-password-form')).not.toBeInTheDocument();
    expect(resetPasswordMock).not.toHaveBeenCalled();
    expect(toastMock.error).not.toHaveBeenCalled();
  });

  it('should show error when password does not meet validation rules', async () => {
    const resetPasswordMock = promiseMock();
    setupUseAuth({ resetPassword: resetPasswordMock });
    renderResetPasswordForm();

    await act(async () => {
      fireEvent.change(screen.getByTestId('reset-password-form-password-input'), {
        target: { value: 'weak' },
      });
      fireEvent.submit(screen.getByTestId('reset-password-form'));
    });

    expect(screen.getByText('errors.password.invalid')).toBeInTheDocument();
    expect(resetPasswordMock).not.toHaveBeenCalled();
    expect(toastMock.error).not.toHaveBeenCalled();
  });

  it('should render token correctly in the form', () => {
    renderResetPasswordForm({ tokenProp: 'test-token' });
    const tokenInput = screen.getByTestId('reset-password-form-token');
    expect(tokenInput).toHaveAttribute('value', 'test-token');
    expect(tokenInput).toHaveAttribute('type', 'hidden');
    expect(tokenInput).toHaveAttribute('readonly');
  });

  it('should render snapshot correctly', () => {
    const { asFragment } = renderResetPasswordForm();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should show error and not submit if token does not match tokenProp', async () => {
    const resetPasswordMock = promiseMock();
    setupUseAuth({ resetPassword: resetPasswordMock });
    setupUseToast();

    // Mock useForm to have a different token in values than tokenProp
    const mockUseForm = jest.spyOn(require('@ui/hooks/useForm'), 'useForm');

    mockUseForm.mockReturnValue({
      values: { password: 'Password123!', token: 'wrong-token' },
      errors: {},
      touched: {},
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: jest.fn(e => {
        e.preventDefault();
        toastMock.error('reset.invalid_token');
      }),
      isSubmitting: false,
      isThrottled: false,
      canSubmit: true,
      timeUntilNextSubmission: 0,
      remainingAttempts: 0,
      resetThrottle: jest.fn(),
      activateThrottle: jest.fn(),
      handleCheckboxChange: jest.fn(),
      resetForm: jest.fn(),
      hasValidationErrors: false,
    });

    renderResetPasswordForm({ tokenProp: 'expected-token' });

    await act(async () => {
      fireEvent.change(screen.getByTestId('reset-password-form-password-input'), {
        target: { value: 'Password123!' },
      });
      fireEvent.click(screen.getByTestId('reset-password-form-button'));
    });

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith('reset.invalid_token');
      expect(resetPasswordMock).not.toHaveBeenCalled();
    });

    mockUseForm.mockRestore();
  });

  it('should show attempts warning when remaining attempts is 2 or less', () => {
    // Mock useForm para devolver remainingAttempts = 2
    const mockUseForm = jest.spyOn(require('@ui/hooks/useForm'), 'useForm');

    mockUseForm.mockReturnValue({
      values: { password: 'Password123!', token: 'valid-token' },
      errors: {},
      touched: {},
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: jest.fn(),
      isSubmitting: false,
      isThrottled: false,
      canSubmit: true,
      timeUntilNextSubmission: 0,
      remainingAttempts: 2, // This should show the warning
      resetThrottle: jest.fn(),
      activateThrottle: jest.fn(),
      handleCheckboxChange: jest.fn(),
      resetForm: jest.fn(),
      hasValidationErrors: false,
    });

    renderResetPasswordForm({ tokenProp: 'valid-token' });

    expect(screen.getByTestId('reset-password-form-attempts-warning')).toBeInTheDocument();
    expect(screen.getByTestId('reset-password-form-attempts-warning')).toHaveTextContent(
      'security.throttle.attempts_remaining'
    );

    mockUseForm.mockRestore();
  });

  it('should show validation errors', async () => {
    const resetPasswordMock = promiseMock();
    setupUseAuth({ resetPassword: resetPasswordMock });
    renderResetPasswordForm();

    // First fill the field to enable the button
    await act(async () => {
      fireEvent.change(screen.getByTestId('reset-password-form-password-input'), {
        target: { value: 'test' },
      });
    });

    // Then clear it and try to submit
    await act(async () => {
      fireEvent.change(screen.getByTestId('reset-password-form-password-input'), {
        target: { value: '' },
      });
      fireEvent.submit(screen.getByTestId('reset-password-form'));
    });

    expect(screen.getByText('errors.password.required')).toBeInTheDocument();
    expect(screen.getByTestId('reset-password-form-button')).toBeDisabled();
  });
});
