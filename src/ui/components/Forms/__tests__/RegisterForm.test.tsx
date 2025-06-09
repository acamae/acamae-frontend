jest.mock('react-i18next');
jest.mock('@ui/hooks/useToast');
jest.mock('@ui/hooks/useAuth');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';
import RegisterForm from '@ui/components/Forms/RegisterForm';
import { useAuth } from '@ui/hooks/useAuth';
import { useToast } from '@ui/hooks/useToast';

const registerMock = jest.fn();
const toastMock = { error: jest.fn(), success: jest.fn() };
const navigateMock = jest.fn();

function setupUseAuth({
  loading = false,
  error = null,
  isAuthenticated = false,
}: {
  loading?: boolean;
  error?: string | null;
  isAuthenticated?: boolean;
} = {}) {
  (useAuth as jest.Mock).mockReturnValue({
    register: registerMock,
    loading,
    error,
    isAuthenticated,
  });
}

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

// Limpieza antes de cada test
beforeEach(() => {
  jest.clearAllMocks();
  setupUseTranslation();
  setupUseAuth();
  setupUseToast();
  setupUseNavigate();
});

describe('RegisterForm', () => {
  it('renderiza correctamente el formulario', () => {
    render(<RegisterForm />);
    expect(screen.getByTestId('register-form-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('register-form-username-input')).toBeInTheDocument();
    expect(screen.getByTestId('register-form-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('register-form-confirm-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('register-form-terms-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('register-form-button')).toBeInTheDocument();
  });

  it('llama a register y muestra toast de éxito en registro correcto', async () => {
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
      expect(registerMock).toHaveBeenCalledTimes(1);
      expect(registerMock).toHaveBeenCalledWith({
        email: 'test@email.com',
        username: 'testuser',
        password: 'Password123!',
      });
      expect(toastMock.success).toHaveBeenCalledWith('register.success', 'register.welcome');
      expect(navigateMock).toHaveBeenCalledWith(APP_ROUTES.LOGIN);
    });
  });

  it('muestra toast de error si el registro falla', async () => {
    setupUseAuth({ error: 'Invalid' });

    render(<RegisterForm />);
    fireEvent.submit(screen.getByTestId('register-form'));

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith('Invalid', 'register.failed');
    });
  });

  it('muestra errores de validación', () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByTestId('register-form-email-input'), {
      target: { name: 'email', value: 'invalid-email' },
    });
    fireEvent.change(screen.getByTestId('register-form-username-input'), {
      target: { name: 'username', value: 'invalid-username' },
    });
    fireEvent.change(screen.getByTestId('register-form-password-input'), {
      target: { name: 'password', value: 'invalid-password' },
    });
    fireEvent.change(screen.getByTestId('register-form-confirm-password-input'), {
      target: { name: 'confirmPassword', value: 'invalid-confirm-password' },
    });
    fireEvent.click(screen.getByTestId('register-form-terms-checkbox'));
    fireEvent.submit(screen.getByTestId('register-form'));

    expect(screen.getByText('errors.email.invalid')).toBeInTheDocument();
    expect(screen.getByText('errors.username.invalid')).toBeInTheDocument();
    expect(screen.getByText('errors.password.invalid')).toBeInTheDocument();
  });

  it('deshabilita el botón si loading es true', () => {
    setupUseAuth({ loading: true });
    render(<RegisterForm />);
    expect(screen.getByTestId('register-form-button')).toBeDisabled();
  });

  it('muestra feedback de error si error global', () => {
    setupUseAuth({ error: 'register.failed' });
    render(<RegisterForm />);
    expect(toastMock.error).toHaveBeenCalledWith('register.failed', 'register.failed');
  });

  it('maneja error de registro cuando es un string', async () => {
    const errorMessage = 'Error de registro';
    registerMock.mockRejectedValueOnce(errorMessage);

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
      expect(registerMock).toHaveBeenCalledWith({
        email: 'test@email.com',
        username: 'testuser',
        password: 'Password123!',
      });
      expect(toastMock.error).toHaveBeenCalledWith(errorMessage, 'register.failed');
    });
  });

  it('maneja error de registro cuando es un objeto con message', async () => {
    const errorMessage = 'Error de registro';
    registerMock.mockRejectedValueOnce({ message: errorMessage });

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
      expect(registerMock).toHaveBeenCalledWith({
        email: 'test@email.com',
        username: 'testuser',
        password: 'Password123!',
      });
      expect(toastMock.error).toHaveBeenCalledWith(errorMessage, 'register.failed');
    });
  });

  it('maneja error de registro cuando es un objeto sin message', async () => {
    registerMock.mockRejectedValueOnce({});

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
      expect(registerMock).toHaveBeenCalledWith({
        email: 'test@email.com',
        username: 'testuser',
        password: 'Password123!',
      });
      expect(toastMock.error).toHaveBeenCalledWith('register.failed', 'register.failed');
    });
  });

  it('alterna la visibilidad de la contraseña', () => {
    render(<RegisterForm />);

    const passwordInput = screen.getByTestId('register-form-password-input');
    const toggleButton = screen.getByTestId('btn-toggle-password');

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveTextContent('👁️');

    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveTextContent('🙈');

    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveTextContent('👁️');
  });

  it('alterna la visibilidad de la confirmación de contraseña', () => {
    render(<RegisterForm />);

    const confirmPasswordInput = screen.getByTestId('register-form-confirm-password-input');
    const toggleButton = screen.getByTestId('btn-toggle-confirm-password');

    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveTextContent('👁️');

    fireEvent.click(toggleButton);

    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveTextContent('🙈');

    fireEvent.click(toggleButton);

    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveTextContent('👁️');
  });
});
