import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { IPromiseMock, promiseMock } from '@shared/utils/apiTestUtils';
import RegisterForm from '@ui/components/Forms/RegisterForm';
import { useAuth } from '@ui/hooks/useAuth';
import { useToast } from '@ui/hooks/useToast';

// Mock zxcvbn
jest.mock('zxcvbn', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    score: 0,
    feedback: {
      warning: '',
      suggestions: [],
    },
  })),
}));

// Mock hooks
jest.mock('react-i18next');
jest.mock('@ui/hooks/useAuth');
jest.mock('@ui/hooks/useToast');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
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
const navigateMock = jest.fn();

const setupUseAuth = ({
  loading = false,
  isAuthenticated = false,
  register = promiseMock(),
}: {
  loading?: boolean;
  isAuthenticated?: boolean;
  register?: IPromiseMock;
} = {}) => {
  (useAuth as jest.Mock).mockReturnValue({
    loading,
    isAuthenticated,
    register,
  });
};

function setupUseToast() {
  (useToast as jest.Mock).mockReturnValue(toastMock);
}

function setupUseNavigate() {
  (useNavigate as jest.Mock).mockReturnValue(navigateMock);
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

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupUseTranslation();
    setupUseAuth();
    setupUseToast();
    setupUseNavigate();
  });

  it('should render the form correctly', () => {
    render(<RegisterForm />);
    expect(screen.getByTestId('register-form-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('register-form-username-input')).toBeInTheDocument();
    expect(screen.getByTestId('register-form-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('register-form-confirm-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('register-form-terms-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('register-form-button')).toBeInTheDocument();
  });

  it('should handle successful form submission', async () => {
    const registerMock = promiseMock();
    setupUseAuth({ register: registerMock });

    render(<RegisterForm />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('register-form-email-input'), {
        target: { name: 'email', value: 'test@email.com' },
      });
      fireEvent.change(screen.getByTestId('register-form-username-input'), {
        target: { name: 'username', value: 'testuser' },
      });
      fireEvent.change(screen.getByTestId('register-form-password-input'), {
        target: { name: 'password', value: 'Password123!' },
      });
      fireEvent.change(screen.getByTestId('register-form-confirm-password-input'), {
        target: { name: 'confirmPassword', value: 'Password123!' },
      });
      fireEvent.click(screen.getByTestId('register-form-terms-checkbox'));
      fireEvent.submit(screen.getByTestId('register-form'));
    });

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        email: 'test@email.com',
        username: 'testuser',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        terms: true,
      });
      expect(toastMock.success).not.toHaveBeenCalled();
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('should show error toast when registration fails', async () => {
    const registerMock = promiseMock({ error: 'Invalid' });
    setupUseAuth({ register: registerMock });

    render(<RegisterForm />);
    fireEvent.change(screen.getByTestId('register-form-email-input'), {
      target: { name: 'email', value: 'test@email.com' },
    });
    fireEvent.change(screen.getByTestId('register-form-username-input'), {
      target: { name: 'username', value: 'testuser' },
    });
    fireEvent.change(screen.getByTestId('register-form-password-input'), {
      target: { name: 'password', value: 'Password123!' },
    });
    fireEvent.change(screen.getByTestId('register-form-confirm-password-input'), {
      target: { name: 'confirmPassword', value: 'Password123!' },
    });
    fireEvent.click(screen.getByTestId('register-form-terms-checkbox'));
    fireEvent.submit(screen.getByTestId('register-form'));
    await waitFor(() => {
      expect(toastMock.error).not.toHaveBeenCalled();
    });
  });

  it('should show validation errors', async () => {
    render(<RegisterForm />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('register-form-email-input'), {
        target: { name: 'email', value: 'invalid-email' },
      });
      fireEvent.blur(screen.getByTestId('register-form-email-input'));

      fireEvent.change(screen.getByTestId('register-form-username-input'), {
        target: { name: 'username', value: 'a' },
      });
      fireEvent.blur(screen.getByTestId('register-form-username-input'));

      fireEvent.change(screen.getByTestId('register-form-password-input'), {
        target: { name: 'password', value: 'weak' },
      });
      fireEvent.blur(screen.getByTestId('register-form-password-input'));

      fireEvent.change(screen.getByTestId('register-form-confirm-password-input'), {
        target: { name: 'confirmPassword', value: 'different' },
      });
      fireEvent.blur(screen.getByTestId('register-form-confirm-password-input'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('register-form-email-error')).toHaveTextContent(
        'errors.email.invalid'
      );
      expect(screen.getByTestId('register-form-username-error')).toHaveTextContent(
        'errors.username.invalid'
      );
      expect(screen.getByTestId('register-form-password-error')).toHaveTextContent(
        'errors.password.invalid'
      );
      expect(screen.getByTestId('register-form-confirm-password-error')).toHaveTextContent(
        'errors.password.mismatch'
      );
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId('register-form'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('register-form-button')).toBeInTheDocument();
      // The button should be disabled when there are validation errors
      expect(screen.getByTestId('register-form-button')).toBeDisabled();
    });
  });

  it('should show invalid errors when email and username are empty', async () => {
    render(<RegisterForm />);
    await act(async () => {
      fireEvent.change(screen.getByTestId('register-form-email-input'), {
        target: { name: 'email', value: '' },
      });
      fireEvent.change(screen.getByTestId('register-form-username-input'), {
        target: { name: 'username', value: '' },
      });
      fireEvent.submit(screen.getByTestId('register-form'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('register-form-email-error')).toHaveTextContent(
        'errors.email.invalid'
      );
      expect(screen.getByTestId('register-form-username-error')).toHaveTextContent(
        'errors.username.invalid'
      );
    });
  });

  it('should disable the button when loading is true', () => {
    setupUseAuth({ loading: true });
    render(<RegisterForm />);
    expect(screen.getByTestId('register-form-button')).toBeDisabled();
  });

  it('should show error feedback when there is a global error', async () => {
    const registerMock = promiseMock({ error: 'register.failed' });
    setupUseAuth({ register: registerMock });
    render(<RegisterForm />);
    fireEvent.change(screen.getByTestId('register-form-email-input'), {
      target: { name: 'email', value: 'test@email.com' },
    });
    fireEvent.change(screen.getByTestId('register-form-username-input'), {
      target: { name: 'username', value: 'testuser' },
    });
    fireEvent.change(screen.getByTestId('register-form-password-input'), {
      target: { name: 'password', value: 'Password123!' },
    });
    fireEvent.change(screen.getByTestId('register-form-confirm-password-input'), {
      target: { name: 'confirmPassword', value: 'Password123!' },
    });
    fireEvent.click(screen.getByTestId('register-form-terms-checkbox'));
    fireEvent.submit(screen.getByTestId('register-form'));
    await waitFor(() => {
      expect(toastMock.error).not.toHaveBeenCalled();
    });
  });

  it('should toggle password visibility', () => {
    render(<RegisterForm />);

    const passwordInput = screen.getByTestId('register-form-password-input');
    const toggleButton = screen.getByTestId('btn-toggle-password');

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton.querySelector('.bi-eye')).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(toggleButton.querySelector('.bi-eye-slash')).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton.querySelector('.bi-eye')).toBeInTheDocument();
  });

  it('should toggle confirm password visibility', () => {
    render(<RegisterForm />);

    const confirmPasswordInput = screen.getByTestId('register-form-confirm-password-input');
    const toggleButton = screen.getByTestId('btn-toggle-confirm-password');

    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    expect(toggleButton.querySelector('.bi-eye')).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    expect(toggleButton.querySelector('.bi-eye-slash')).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    expect(toggleButton.querySelector('.bi-eye')).toBeInTheDocument();
  });
});
