import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import { IPromiseMock, promiseMock } from '@shared/utils/apiTestUtils';
import ResetPasswordForm from '@ui/components/Forms/ResetPasswordForm';
import { useAuth } from '@ui/hooks/useAuth';
import { useToast } from '@ui/hooks/useToast';

jest.mock('@ui/hooks/useAuth');
jest.mock('@ui/hooks/useToast');
jest.mock('react-i18next');

const toastMock = { error: jest.fn(), success: jest.fn() };

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
    expect(screen.getByTestId('btn-toggle-password')).toHaveTextContent('👁️');
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
      fireEvent.click(screen.getByTestId('reset-password-form-button'));
    });

    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith({
        token: 'mock-token',
        password: 'Password123!',
      });
      expect(toastMock.success).toHaveBeenCalledWith('reset.success');
    });
  });

  it('should show validation error when password is invalid', async () => {
    renderResetPasswordForm();

    await act(async () => {
      fireEvent.change(screen.getByTestId('reset-password-form-password-input'), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByTestId('reset-password-form-button'));
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
    const error = 'Error de reset';
    const resetPasswordMock = promiseMock({ error });
    setupUseAuth({ resetPassword: resetPasswordMock });
    renderResetPasswordForm();

    await act(async () => {
      fireEvent.change(screen.getByTestId('reset-password-form-password-input'), {
        target: { value: 'Password123!' },
      });
      fireEvent.click(screen.getByTestId('reset-password-form-button'));
    });

    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith({
        token: 'mock-token',
        password: 'Password123!',
      });
      expect(toastMock.error).toHaveBeenCalledWith('reset.failed', error);
    });
  });

  it('should toggle password visibility', async () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByTestId('reset-password-form-password-input');
    const toggleButton = screen.getByTestId('btn-toggle-password');

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveTextContent('👁️');

    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveTextContent('🙈');

    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveTextContent('👁️');
  });

  /*
  @TODO: Implement test for the case of the token being different from the one in the URL
  it('should handle error when token does not match', async () => {

  });
  */

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
      fireEvent.click(screen.getByTestId('reset-password-form-button'));
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
});
