jest.mock('react-i18next');
jest.mock('@ui/hooks/useAuth');
jest.mock('@ui/hooks/useForm');
jest.mock('@ui/hooks/useToast');
jest.mock('@shared/services/axiosService');

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import api from '@shared/services/axiosService';
import { useForm } from '@ui/hooks/useForm';
import { useToast } from '@ui/hooks/useToast';

import ForgotPasswordForm from '../ForgotPasswordForm';

describe('ForgotPasswordForm', () => {
  const t = (key: string) => key;
  const toastMock = { success: jest.fn(), error: jest.fn() };
  const apiPostMock = api.post as jest.Mock;

  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({ t });
    (useToast as jest.Mock).mockReturnValue(toastMock);
    jest.clearAllMocks();
  });

  it('renderiza el formulario correctamente', () => {
    (useForm as jest.Mock).mockImplementation(() => ({
      values: { email: '' },
      errors: {},
      touched: {},
      isSubmitting: false,
      handleChange: jest.fn(),
      handleSubmit: jest.fn(),
    }));
    render(<ForgotPasswordForm />);
    expect(screen.getByTestId('input-email')).toBeInTheDocument();
    expect(screen.getByTestId('btn-forgot-password')).toBeInTheDocument();
  });

  it('muestra error de validación si el email está vacío', async () => {
    (useForm as jest.Mock).mockImplementation(() => ({
      values: { email: '' },
      errors: { email: 'errors.email.required' },
      touched: { email: true },
      isSubmitting: false,
      handleChange: jest.fn(),
      handleSubmit: (e: React.FormEvent) => {
        e.preventDefault();
        // No llama a onSubmit porque hay error
      },
    }));
    render(<ForgotPasswordForm />);
    fireEvent.click(screen.getByTestId('btn-forgot-password'));
    await waitFor(() => {
      expect(screen.getByText('errors.email.required')).toBeInTheDocument();
    });
    expect(apiPostMock).not.toHaveBeenCalled();
  });

  it('muestra error de validación si el email es inválido', async () => {
    (useForm as jest.Mock).mockImplementation(() => ({
      values: { email: 'invalid' },
      errors: { email: 'errors.email.invalid' },
      touched: { email: true },
      isSubmitting: false,
      handleChange: jest.fn(),
      handleSubmit: (e: React.FormEvent) => {
        e.preventDefault();
        // No llama a onSubmit porque hay error
      },
    }));
    render(<ForgotPasswordForm />);
    fireEvent.click(screen.getByTestId('btn-forgot-password'));
    await waitFor(() => {
      expect(screen.getByText('errors.email.invalid')).toBeInTheDocument();
    });
    expect(apiPostMock).not.toHaveBeenCalled();
  });

  it('llama a api.post y muestra mensaje de éxito', async () => {
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
    fireEvent.click(screen.getByTestId('btn-forgot-password'));
    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith('/auth/forgot-password', { email: testEmail });
      expect(toastMock.success).toHaveBeenCalledWith('forgot.success', 'forgot.check_email');
    });
  });

  it('muestra mensaje de error si api.post falla con USER_NOT_FOUND', async () => {
    const testEmail = 'notfound@example.com';
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
      response: { data: { code: 'USER_NOT_FOUND' } },
    });
    render(<ForgotPasswordForm />);
    fireEvent.click(screen.getByTestId('btn-forgot-password'));
    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith('errors.email.not_found', 'forgot.failed');
    });
  });

  it('muestra mensaje de error genérico si api.post falla con error desconocido', async () => {
    const testEmail = 'fail@example.com';
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
    fireEvent.click(screen.getByTestId('btn-forgot-password'));
    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith('forgot.unknown_error', 'forgot.failed');
    });
  });

  it('deshabilita el botón si isSubmitting es true', () => {
    (useForm as jest.Mock).mockImplementation(() => ({
      values: { email: 'test@example.com' },
      errors: {},
      touched: { email: true },
      isSubmitting: true,
      handleChange: jest.fn(),
      handleSubmit: jest.fn(),
    }));
    render(<ForgotPasswordForm />);
    expect(screen.getByTestId('btn-forgot-password')).toBeDisabled();
  });
});
