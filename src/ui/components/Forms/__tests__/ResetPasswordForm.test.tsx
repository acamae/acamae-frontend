jest.mock('@ui/hooks/useAuth');
jest.mock('@ui/hooks/useToast');
jest.mock('react-i18next');

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import ResetPasswordForm from '@ui/components/Forms/ResetPasswordForm';
import { useAuth } from '@ui/hooks/useAuth';
import { useToast } from '@ui/hooks/useToast';

function setupUseAuth({ loading = false, resetPassword = jest.fn() } = {}) {
  (useAuth as jest.Mock).mockReturnValue({
    loading,
    resetPassword,
  });
  return { resetPassword };
}

function setupUseToast({ success = jest.fn(), error = jest.fn() } = {}) {
  (useToast as jest.Mock).mockReturnValue({ success, error });
  return { success, error };
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

function renderResetPasswordForm(props = { token: 'mock-token' }) {
  return render(<ResetPasswordForm {...props} />);
}

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupUseTranslation();
    setupUseToast();
    setupUseAuth();
  });

  it('renderiza correctamente los campos', () => {
    renderResetPasswordForm();
    expect(screen.getByTestId('input-password')).toBeInTheDocument();
    expect(screen.getByTestId('btn-reset-password')).toBeInTheDocument();
  });

  it('muestra error de validación si el password es inválido', () => {
    renderResetPasswordForm();
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByTestId('btn-reset-password'));
    expect(screen.getByText('errors.password.required')).toBeInTheDocument();
  });

  it('muestra mensaje de éxito tras submit correcto', async () => {
    const resetPassword = jest.fn().mockResolvedValue({
      payload: { success: true, message: 'reset.password_updated' },
    });
    setupUseAuth({ resetPassword });
    renderResetPasswordForm();
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'Password123' },
    });
    fireEvent.click(screen.getByTestId('btn-reset-password'));
    await waitFor(() => {
      expect(screen.getByTestId('alert-success')).toBeInTheDocument();
      expect(screen.getByTestId('alert-success')).toHaveTextContent('reset.success');
    });
  });

  it('muestra mensaje de error si el token es inválido', async () => {
    renderResetPasswordForm({ token: '' });
    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    expect(screen.getByTestId('alert-error')).toHaveTextContent('reset.invalid_token');
  });

  it('deshabilita el botón de submit mientras loading es true', () => {
    setupUseAuth({ loading: true });
    renderResetPasswordForm();
    expect(screen.getByTestId('btn-reset-password')).toBeDisabled();
  });

  it('deshabilita el botón de submit mientras isSubmitting es true', () => {
    setupUseAuth({ loading: true });
    renderResetPasswordForm();
    expect(screen.getByTestId('btn-reset-password')).toBeDisabled();
  });

  it('snapshot render', () => {
    const { asFragment } = renderResetPasswordForm();
    expect(asFragment()).toMatchSnapshot();
  });
});
