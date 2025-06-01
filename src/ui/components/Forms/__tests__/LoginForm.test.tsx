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
});
