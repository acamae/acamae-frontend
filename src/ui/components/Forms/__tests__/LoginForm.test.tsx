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
      expect(loginMock).toHaveBeenCalledTimes(1);
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
    setupUseAuth({ error: 'Invalid credentials' });
    render(<LoginForm />);
    fireEvent.submit(screen.getByTestId('login-form'));
    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith('Invalid credentials', 'login.failed');
    });
  });

  it('maneja error de login cuando es un string', async () => {
    const errorMessage = 'Error de autenticación';
    loginMock.mockRejectedValueOnce(errorMessage);
    setupUseAuth({ error: null });

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

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith(errorMessage, 'login.failed');
    });
  });

  it('maneja error de login cuando es un objeto con message', async () => {
    const errorMessage = 'Error de autenticación';
    loginMock.mockRejectedValueOnce({ message: errorMessage });
    setupUseAuth({ error: null });

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

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith(errorMessage, 'login.failed');
    });
  });

  it('maneja error de login cuando es un objeto sin message', async () => {
    loginMock.mockRejectedValueOnce({});
    setupUseAuth({ error: null });

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

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith('login.failed', 'login.failed');
    });
  });

  it('maneja error de login cuando es un objeto con message undefined', async () => {
    loginMock.mockRejectedValueOnce({ message: undefined });
    setupUseAuth({ error: null });

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

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith('login.failed', 'login.failed');
    });
  });

  it('maneja error de login cuando es un objeto con message null', async () => {
    loginMock.mockRejectedValueOnce({ message: null });
    setupUseAuth({ error: null });

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

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith('login.failed', 'login.failed');
    });
  });

  it('maneja error de login cuando es un objeto con message vacío', async () => {
    loginMock.mockRejectedValueOnce({ message: '' });
    setupUseAuth({ error: null });

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

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith('login.failed', 'login.failed');
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
      expect(navigateMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirige a la ruta personalizada cuando se proporciona', async () => {
    setupUseAuth({ isAuthenticated: true });
    render(<LoginForm redirectTo="/custom-route" />);

    await waitFor(() => {
      expect(toastMock.success).toHaveBeenCalledWith('login.success', 'login.welcome');
      expect(navigateMock).toHaveBeenCalledWith('/custom-route');
    });
  });
});
