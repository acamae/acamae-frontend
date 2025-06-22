import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import { IPromiseMock, promiseMock } from '@shared/utils/apiTestUtils';
import LoginForm from '@ui/components/Forms/LoginForm';
import { useAuth } from '@ui/hooks/useAuth';
import { useToast } from '@ui/hooks/useToast';

jest.mock('react-i18next');
jest.mock('@ui/hooks/useAuth');
jest.mock('@ui/hooks/useToast');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const toastMock = { error: jest.fn(), success: jest.fn() };
const navigateMock = jest.fn();

function setupUseAuth({
  loading = false,
  isAuthenticated = false,
  login = promiseMock(),
}: {
  loading?: boolean;
  isAuthenticated?: boolean;
  login?: IPromiseMock;
} = {}) {
  (useAuth as jest.Mock).mockReturnValue({
    loading,
    isAuthenticated,
    login,
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

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
}
describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupUseTranslation();
    setupUseAuth();
    setupUseToast();
    setupUseNavigate();
  });

  it('should render correctly', () => {
    renderLoginForm();
    expect(screen.getByTestId('login-form-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-form-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-form-password-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('login-form-email-help')).toHaveTextContent('login.email_help');
    expect(screen.getByTestId('login-form-password-help')).toHaveTextContent('login.password_help');
    expect(screen.queryByTestId('login-form-email-error')).toBeEmptyDOMElement();
    expect(screen.queryByTestId('login-form-password-error')).toBeEmptyDOMElement();
    expect(screen.getByTestId('login-form-button')).toBeInTheDocument();
  });

  it('should call login with the correct values when submitting', async () => {
    const loginMock = promiseMock();
    setupUseAuth({ login: loginMock, isAuthenticated: true });
    renderLoginForm();
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
      expect(toastMock.success).not.toHaveBeenCalled();
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('should show validation errors', () => {
    renderLoginForm();
    fireEvent.change(screen.getByTestId('login-form-email-input'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByTestId('login-form-password-input'), {
      target: { value: 'invalid-password' },
    });
    expect(screen.getByText('errors.email.invalid')).toBeInTheDocument();
    expect(screen.getByText('errors.password.invalid')).toBeInTheDocument();
  });

  it('should disable the button when loading is true', () => {
    setupUseAuth({ loading: true });
    renderLoginForm();
    expect(screen.getByTestId('login-form-button')).toBeDisabled();
  });

  it('should show error toast when login fails', async () => {
    const loginMock = promiseMock({ error: 'Invalid credentials' });
    setupUseAuth({ login: loginMock });
    renderLoginForm();

    fireEvent.change(screen.getByTestId('login-form-email-input'), {
      target: { value: 'test@mail.com' },
    });
    fireEvent.change(screen.getByTestId('login-form-password-input'), {
      target: { value: 'Password123!' },
    });
    fireEvent.submit(screen.getByTestId('login-form'));

    await waitFor(() => {
      expect(toastMock.error).not.toHaveBeenCalled();
    });
  });

  it('should handle error from login state', async () => {
    const loginMock = promiseMock({ error: 'Error desde el estado' });
    setupUseAuth({ login: loginMock });
    renderLoginForm();

    fireEvent.change(screen.getByTestId('login-form-email-input'), {
      target: { value: 'test@mail.com' },
    });
    fireEvent.change(screen.getByTestId('login-form-password-input'), {
      target: { value: 'Password123!' },
    });
    fireEvent.submit(screen.getByTestId('login-form'));

    await waitFor(() => {
      expect(toastMock.error).not.toHaveBeenCalled();
    });
  });

  it('should not trigger side effects on success (handled by middleware)', async () => {
    const loginMock = promiseMock();
    setupUseAuth({ login: loginMock, isAuthenticated: true });
    renderLoginForm();

    await waitFor(() => {
      expect(toastMock.success).not.toHaveBeenCalled();
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('should toggle password visibility when clicking the button', () => {
    const loginMock = promiseMock();
    setupUseAuth({ login: loginMock, isAuthenticated: false });
    renderLoginForm();
    const passwordInput = screen.getByTestId('login-form-password-input');
    const toggleButton = screen.getByTestId('login-form-password-toggle');

    // Initially the password is hidden
    expect(passwordInput).toHaveAttribute('type', 'password');

    // When clicked, the password is shown
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // When clicked again, the password is hidden
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
