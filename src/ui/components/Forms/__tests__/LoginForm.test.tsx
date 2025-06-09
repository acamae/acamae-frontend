jest.mock('react-i18next');
jest.mock('@ui/hooks/useAuth');
jest.mock('@ui/hooks/useToast');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';
import LoginForm from '@ui/components/Forms/LoginForm';
import { useAuth } from '@ui/hooks/useAuth';
import { useToast } from '@ui/hooks/useToast';

const loginMock = jest.fn();
const toastMock = { error: jest.fn(), success: jest.fn() };
const navigateMock = jest.fn();
const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

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
    login: loginMock,
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

beforeEach(() => {
  jest.clearAllMocks();
  setupUseTranslation();
  setupUseAuth();
  setupUseToast();
  setupUseNavigate();
});

afterAll(() => {
  consoleErrorMock.mockRestore();
});

describe('LoginForm', () => {
  it('renderiza correctamente', () => {
    render(<LoginForm />);
    expect(screen.getByTestId('login-form-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-form-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-form-button')).toBeInTheDocument();
  });

  it('llama a login con los valores correctos al hacer submit', async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByTestId('login-form-email-input'), {
      target: { value: 'test@mail.com' },
    });
    fireEvent.change(screen.getByTestId('login-form-password-input'), {
      target: { value: 'Password123!' },
    });
    fireEvent.submit(screen.getByTestId('login-form'));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'test@mail.com',
        password: 'Password123!',
      });
    });
  });

  it('muestra errores de validación', () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByTestId('login-form-email-input'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByTestId('login-form-password-input'), {
      target: { value: 'invalid-password' },
    });
    expect(screen.getByText('errors.email.invalid')).toBeInTheDocument();
    expect(screen.getByText('errors.password.invalid')).toBeInTheDocument();
  });

  it('muestra toast de error si login falla', async () => {
    const errorMessage = 'Invalid credentials';
    setupUseAuth({ error: errorMessage });
    render(<LoginForm />);

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith(errorMessage, 'login.failed');
    });
  });

  it('maneja error de login desde el estado de error', async () => {
    const errorMessage = 'Error desde el estado';
    setupUseAuth({ error: errorMessage });

    render(<LoginForm />);

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith(errorMessage, 'login.failed');
    });
  });

  it('redirige al dashboard cuando el login es exitoso', async () => {
    setupUseAuth({ isAuthenticated: true });
    render(<LoginForm />);

    await waitFor(() => {
      expect(toastMock.success).toHaveBeenCalledWith('login.success', 'login.welcome');
      expect(navigateMock).toHaveBeenCalledWith(APP_ROUTES.DASHBOARD);
    });
  });

  it('alterna la visibilidad de la contraseña al hacer clic en el botón', () => {
    render(<LoginForm />);
    const passwordInput = screen.getByTestId('login-form-password-input');
    const toggleButton = screen.getByTestId('login-form-password-toggle');

    // Inicialmente la contraseña está oculta
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Al hacer clic, la contraseña se muestra
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Al hacer clic de nuevo, la contraseña se oculta
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
