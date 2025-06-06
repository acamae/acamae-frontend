import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { useForm } from '@ui/hooks/useForm';
import { useToast } from '@ui/hooks/useToast';
import api from '@shared/services/axiosService';

import ForgotPasswordForm from '@ui/components/Forms/ForgotPasswordForm';

// Mock de las dependencias
jest.mock('@ui/hooks/useForm');
jest.mock('@ui/hooks/useToast');
jest.mock('@shared/services/axiosService', () => ({
  post: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'forgot.email': 'Correo electrónico',
        'forgot.email_help': 'Introduce el correo electrónico asociado a tu cuenta.',
        'forgot.success': 'Si tu correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
        'forgot.check_email': 'Revisa tu correo electrónico',
        'errors.email.not_found': 'Ese email no está registrado.',
        'forgot.failed': 'No se pudo enviar el correo',
        'errors.email.invalid': 'Correo electrónico inválido',
        'forgot.submit': 'Enviar enlace de recuperación',
        'errors.email.required': 'El correo electrónico es requerido',
      };
      return translations[key] || key;
    },
  }),
}));

describe('ForgotPasswordForm', () => {
  const mockShowToast = jest.fn();
  const mockHideToast = jest.fn();
  const apiPostMock = api.post as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({
      success: mockShowToast,
      error: mockShowToast,
      showToast: mockShowToast,
      hideToast: mockHideToast,
    });
  });

  it('muestra el formulario correctamente', () => {
    (useForm as jest.Mock).mockReturnValue({
      values: { email: '' },
      errors: {},
      touched: {},
      isSubmitting: false,
      handleChange: jest.fn(),
      handleSubmit: jest.fn(),
    });

    render(<ForgotPasswordForm />);
    
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar enlace de recuperación/i })).toBeInTheDocument();
  });

  it('maneja el envío exitoso del formulario', async () => {
    const testEmail = 'test@example.com';
    (useForm as jest.Mock).mockImplementation(config => ({
      values: { email: testEmail },
      errors: {},
      touched: { email: true },
      isSubmitting: false,
      handleChange: jest.fn(),
      handleSubmit: (e: React.FormEvent) => {
        e.preventDefault();
        config.onSubmit({ email: testEmail });
      },
    }));

    apiPostMock.mockResolvedValueOnce({});
    
    render(<ForgotPasswordForm />);
    
    const submitButton = screen.getByRole('button', { name: /enviar enlace de recuperación/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith('/auth/forgot-password', { email: testEmail });
      expect(mockShowToast).toHaveBeenCalledWith(
        'Si tu correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
        'Revisa tu correo electrónico'
      );
    });
  });

  it('maneja el error en el envío del formulario', async () => {
    const testEmail = 'test@example.com';
    (useForm as jest.Mock).mockImplementation(config => ({
      values: { email: testEmail },
      errors: {},
      touched: { email: true },
      isSubmitting: false,
      handleChange: jest.fn(),
      handleSubmit: (e: React.FormEvent) => {
        e.preventDefault();
        config.onSubmit({ email: testEmail });
      },
    }));

    apiPostMock.mockRejectedValueOnce({
      response: { data: { code: 'USER_NOT_FOUND' } }
    });
    
    render(<ForgotPasswordForm />);
    
    const submitButton = screen.getByRole('button', { name: /enviar enlace de recuperación/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith('/auth/forgot-password', { email: testEmail });
      expect(mockShowToast).toHaveBeenCalledWith(
        'Ese email no está registrado.',
        'No se pudo enviar el correo'
      );
    });
  });

  it('maneja el error genérico en el envío del formulario', async () => {
    const testEmail = 'test@example.com';
    (useForm as jest.Mock).mockImplementation(config => ({
      values: { email: testEmail },
      errors: {},
      touched: { email: true },
      isSubmitting: false,
      handleChange: jest.fn(),
      handleSubmit: (e: React.FormEvent) => {
        e.preventDefault();
        config.onSubmit({ email: testEmail });
      },
    }));

    apiPostMock.mockRejectedValueOnce({});
    
    render(<ForgotPasswordForm />);
    
    const submitButton = screen.getByRole('button', { name: /enviar enlace de recuperación/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith('/auth/forgot-password', { email: testEmail });
      expect(mockShowToast).toHaveBeenCalledWith(
        'forgot.unknown_error',
        'No se pudo enviar el correo'
      );
    });
  });

  describe('validación del formulario', () => {
    it('valida que el correo electrónico no esté vacío', async () => {
      (useForm as jest.Mock).mockReturnValue({
        values: { email: '' },
        errors: { email: 'errors.email.required' },
        touched: { email: true },
        isSubmitting: false,
        handleChange: jest.fn(),
        handleSubmit: jest.fn(),
      });
      
      render(<ForgotPasswordForm />);
      
      expect(screen.getByText('errors.email.required')).toBeInTheDocument();
      expect(apiPostMock).not.toHaveBeenCalled();
    });
  });

  it('no muestra errores cuando el correo es válido', async () => {
    (useForm as jest.Mock).mockReturnValue({
      values: { email: 'test@example.com' },
      errors: {},
      touched: { email: true },
      isSubmitting: false,
      handleChange: jest.fn(),
      handleSubmit: jest.fn(),
    });
    
    render(<ForgotPasswordForm />);
    
    expect(screen.queryByText('errors.email.required')).not.toBeInTheDocument();
    expect(screen.queryByText('errors.email.invalid')).not.toBeInTheDocument();
    expect(apiPostMock).not.toHaveBeenCalled();
  });

  it('muestra el estado de carga durante el envío', async () => {
    (useForm as jest.Mock).mockReturnValue({
      values: { email: 'test@example.com' },
      errors: {},
      touched: { email: true },
      isSubmitting: true,
      handleChange: jest.fn(),
      handleSubmit: jest.fn(),
    });
    
    render(<ForgotPasswordForm />);
    
    const submitButton = screen.getByRole('button', { name: /enviar enlace de recuperación/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('aria-busy', 'true');
  });
}); 