import { screen, waitFor } from '@testing-library/react';

import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { EmailVerificationStatus } from '@domain/types/apiSchema';
import i18n from '@infrastructure/i18n';
import { APP_ROUTES } from '@shared/constants/appRoutes';
import { createTestProviderFactory } from '@shared/utils/renderProvider';
import EmailVerificationPage from '@ui/pages/EmailVerificationPage';

// Mock the use case and repository
jest.mock('@application/use-cases/auth/VerifyEmailUseCase', () => ({
  VerifyEmailUseCase: jest.fn(),
}));

jest.mock('@infrastructure/api/AuthApiRepository', () => ({
  AuthApiRepository: jest.fn(),
}));

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('EmailVerificationPage', () => {
  const mockExecute = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the use case
    const { VerifyEmailUseCase } = require('@application/use-cases/auth/VerifyEmailUseCase');
    VerifyEmailUseCase.mockImplementation(() => ({
      execute: mockExecute,
    }));

    // Mock the repository
    const { AuthApiRepository } = require('@infrastructure/api/AuthApiRepository');
    AuthApiRepository.mockImplementation(() => ({}));
  });

  const renderEmailVerificationPage = (queryParams = '?token=valid-token') => {
    const renderWithProviders = createTestProviderFactory();
    return renderWithProviders(<EmailVerificationPage />, {
      route: `/verify-email${queryParams}`,
    });
  };

  it('should show loading state initially', () => {
    mockExecute.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderEmailVerificationPage();

    expect(screen.getByTestId('email-verification-page')).toBeInTheDocument();
    expect(screen.getByTestId('email-verification-loading-title')).toBeInTheDocument();
    expect(screen.getByText(i18n.t('verification.processing.title'))).toBeInTheDocument();
  });

  it('should redirect to expired page when no token provided', () => {
    renderEmailVerificationPage('');

    expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.VERIFY_EMAIL_EXPIRED);
  });

  it('should redirect to success page on successful verification', async () => {
    mockExecute.mockResolvedValue({
      success: true,
      data: {
        status: EmailVerificationStatus.SUCCESS,
        message: 'Email verified successfully',
        resendRequired: false,
      },
    });

    renderEmailVerificationPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.VERIFY_EMAIL_SUCCESS);
    });
  });

  it('should redirect to expired page on expired token', async () => {
    mockExecute.mockResolvedValue({
      success: true,
      data: {
        status: EmailVerificationStatus.EXPIRED_TOKEN,
        message: 'Token has expired',
        resendRequired: true,
      },
    });

    renderEmailVerificationPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.VERIFY_EMAIL_EXPIRED);
    });
  });

  it('should redirect to already verified page on already verified status', async () => {
    mockExecute.mockResolvedValue({
      success: true,
      data: {
        status: EmailVerificationStatus.ALREADY_VERIFIED,
        message: 'Email already verified',
        resendRequired: false,
      },
    });

    renderEmailVerificationPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.VERIFY_EMAIL_ALREADY_VERIFIED);
    });
  });

  it('should redirect to error page for invalid token', async () => {
    mockExecute.mockResolvedValue({
      success: true,
      data: {
        status: EmailVerificationStatus.INVALID_TOKEN,
        message: 'Invalid token',
        resendRequired: true,
      },
    });

    renderEmailVerificationPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.VERIFY_EMAIL_ERROR);
    });
  });

  it('should redirect to error page for update failed status', async () => {
    mockExecute.mockResolvedValue({
      success: true,
      data: {
        status: EmailVerificationStatus.UPDATE_FAILED,
        message: 'Update failed',
        resendRequired: true,
      },
    });

    renderEmailVerificationPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.VERIFY_EMAIL_ERROR);
    });
  });

  it('should handle API failure gracefully', async () => {
    mockExecute.mockResolvedValue({
      success: false,
      data: null,
      message: 'API Error',
      code: 'AUTH_TOKEN_INVALID',
    });

    renderEmailVerificationPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.VERIFY_EMAIL_ERROR);
    });
  });

  it('should handle network error gracefully', async () => {
    mockExecute.mockRejectedValue(new Error('Network error'));

    renderEmailVerificationPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.VERIFY_EMAIL_ERROR);
    });
  });

  it('should redirect to expired page when API returns AUTH_TOKEN_EXPIRED', async () => {
    mockExecute.mockResolvedValue({
      success: false,
      data: null,
      message: 'Token expired',
      code: ApiErrorCodes.AUTH_TOKEN_EXPIRED,
    });

    renderEmailVerificationPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.VERIFY_EMAIL_EXPIRED);
    });
  });

  it('should redirect to already verified page when API returns AUTH_USER_ALREADY_VERIFIED', async () => {
    mockExecute.mockResolvedValue({
      success: false,
      data: null,
      message: 'User already verified',
      code: ApiErrorCodes.AUTH_USER_ALREADY_VERIFIED,
    });

    renderEmailVerificationPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.VERIFY_EMAIL_ALREADY_VERIFIED);
    });
  });

  it('should redirect to error page when API returns AUTH_TOKEN_INVALID', async () => {
    mockExecute.mockResolvedValue({
      success: false,
      data: null,
      message: 'Invalid token',
      code: ApiErrorCodes.AUTH_TOKEN_INVALID,
    });

    renderEmailVerificationPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(APP_ROUTES.VERIFY_EMAIL_ERROR);
    });
  });
});
