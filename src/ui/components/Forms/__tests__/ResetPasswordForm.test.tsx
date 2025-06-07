jest.mock('@ui/hooks/useAuth');
jest.mock('@ui/hooks/useToast');
jest.mock('react-i18next');

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import ResetPasswordForm from '@ui/components/Forms/ResetPasswordForm';
import { useAuth } from '@ui/hooks/useAuth';
import { useToast } from '@ui/hooks/useToast';

function setupUseAuth({
  loading = false,
  resetPassword = jest.fn(),
  error = null,
}: {
  loading?: boolean;
  resetPassword?: jest.Mock;
  error?: string | null;
} = {}) {
  (useAuth as jest.Mock).mockReturnValue({
    loading,
    resetPassword,
    error,
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

  it('maneja error de reset cuando es un string', async () => {
    const errorMessage = 'Error de reset';
    const resetPassword = jest.fn().mockResolvedValue({
      payload: { success: false, message: errorMessage },
    });
    setupUseAuth({ resetPassword, error: errorMessage });
    const { error } = setupUseToast();

    renderResetPasswordForm();
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByTestId('btn-reset-password'));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith({
        token: 'mock-token',
        newPassword: 'Password123!',
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('alert-error')).toBeInTheDocument();
      expect(screen.getByTestId('alert-error')).toHaveTextContent('reset.failed');
      expect(error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('maneja error de reset cuando es un objeto con message', async () => {
    const errorMessage = 'Error de reset';
    const resetPassword = jest.fn().mockResolvedValue({
      payload: { success: false, message: errorMessage },
    });
    setupUseAuth({ resetPassword, error: errorMessage });
    const { error } = setupUseToast();

    renderResetPasswordForm();
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByTestId('btn-reset-password'));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith({
        token: 'mock-token',
        newPassword: 'Password123!',
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('alert-error')).toBeInTheDocument();
      expect(screen.getByTestId('alert-error')).toHaveTextContent('reset.failed');
      expect(error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('maneja error de reset cuando es un objeto sin message', async () => {
    const resetPassword = jest.fn().mockResolvedValue({
      payload: { success: false },
    });
    setupUseAuth({ resetPassword, error: 'reset.failed' });
    const { error } = setupUseToast();

    renderResetPasswordForm();
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByTestId('btn-reset-password'));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith({
        token: 'mock-token',
        newPassword: 'Password123!',
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('alert-error')).toBeInTheDocument();
      expect(screen.getByTestId('alert-error')).toHaveTextContent('reset.failed');
      expect(error).toHaveBeenCalledWith('reset.failed');
    });
  });

  it('maneja error global de reset', async () => {
    const errorMessage = 'Error global de reset';
    const resetPassword = jest.fn().mockResolvedValue({
      payload: { success: false, message: errorMessage },
    });
    setupUseAuth({ resetPassword, error: errorMessage });
    const { error } = setupUseToast();

    renderResetPasswordForm();
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByTestId('btn-reset-password'));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith({
        token: 'mock-token',
        newPassword: 'Password123!',
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('alert-error')).toBeInTheDocument();
      expect(screen.getByTestId('alert-error')).toHaveTextContent('reset.failed');
      expect(error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('alterna la visibilidad de la contraseña', () => {
    renderResetPasswordForm();

    const passwordInput = screen.getByTestId('input-password');
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

  it('muestra el estado inicial sin mensaje', () => {
    renderResetPasswordForm();
    expect(screen.queryByTestId('alert-error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('alert-success')).not.toBeInTheDocument();
  });

  it('muestra error cuando no hay token', () => {
    const resetPassword = jest.fn();
    setupUseAuth({ resetPassword });
    const { error } = setupUseToast();

    renderResetPasswordForm({ token: '' });

    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    expect(screen.getByTestId('alert-error')).toHaveTextContent('reset.invalid_token');
    expect(resetPassword).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('muestra error cuando el token es undefined', () => {
    const resetPassword = jest.fn();
    setupUseAuth({ resetPassword });
    const { error } = setupUseToast();

    // @ts-expect-error - Testing invalid token case
    renderResetPasswordForm({ token: undefined });

    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    expect(screen.getByTestId('alert-error')).toHaveTextContent('reset.invalid_token');
    expect(resetPassword).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('inicializa el estado de message como null', () => {
    const { container } = renderResetPasswordForm();
    expect(container.querySelector('[data-testid="alert-error"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="alert-success"]')).not.toBeInTheDocument();
    expect(screen.getByTestId('input-password')).toBeInTheDocument();
  });

  it('maneja error en onSubmit cuando no hay token', async () => {
    const resetPassword = jest.fn();
    setupUseAuth({ resetPassword });
    const { error } = setupUseToast();

    await act(async () => {
      renderResetPasswordForm({ token: '' });
    });

    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    expect(screen.getByTestId('alert-error')).toHaveTextContent('reset.invalid_token');
    expect(resetPassword).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('maneja error en onSubmit cuando el token es undefined', async () => {
    const resetPassword = jest.fn();
    setupUseAuth({ resetPassword });
    const { error } = setupUseToast();

    await act(async () => {
      // @ts-expect-error - Testing invalid token case
      renderResetPasswordForm({ token: undefined });
    });

    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    expect(screen.getByTestId('alert-error')).toHaveTextContent('reset.invalid_token');
    expect(resetPassword).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('maneja error en onSubmit cuando el token se vuelve inválido', async () => {
    const resetPassword = jest.fn();
    setupUseAuth({ resetPassword });
    const { error } = setupUseToast();

    const { rerender } = renderResetPasswordForm({ token: 'valid-token' });

    // Primero verificamos que el formulario está presente
    expect(screen.getByTestId('input-password')).toBeInTheDocument();

    // Luego cambiamos el token a inválido
    await act(async () => {
      rerender(<ResetPasswordForm token="" />);
    });

    // Verificamos que se muestra el mensaje de error
    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    expect(screen.getByTestId('alert-error')).toHaveTextContent('reset.invalid_token');
    expect(resetPassword).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('muestra error cuando el password no cumple las reglas de validación', async () => {
    const resetPassword = jest.fn();
    setupUseAuth({ resetPassword });
    const { error } = setupUseToast();

    renderResetPasswordForm();

    // Envolvemos las interacciones en act()
    await act(async () => {
      fireEvent.change(screen.getByTestId('input-password'), {
        target: { value: 'weak' },
      });
      fireEvent.click(screen.getByTestId('btn-reset-password'));
    });

    // Verificamos que se muestra el error de validación
    expect(screen.getByText('errors.password.invalid')).toBeInTheDocument();

    // Verificamos que no se llama a resetPassword
    expect(resetPassword).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});
