import { screen, waitFor } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';

import { createTestProviderFactory } from '@shared/utils/renderProvider';
import ResetPasswordErrorPage from '@ui/pages/ResetPasswordErrorPage';
import ResetPasswordExpiredPage from '@ui/pages/ResetPasswordExpiredPage';
import ResetPasswordPage from '@ui/pages/ResetPasswordPage';

// Mock the use case and repository
jest.mock('@application/use-cases/auth/ValidateResetTokenUseCase', () => ({
  ValidateResetTokenUseCase: jest.fn(),
}));

jest.mock('@infrastructure/api/auth/AuthApiRepository', () => ({
  AuthApiRepository: jest.fn(),
}));

jest.mock('@ui/components/Forms/ResetPasswordForm', () => {
  return ({ onSuccess }: { onSuccess: () => void }) => (
    <button data-testid="trigger-success" onClick={() => onSuccess()}>
      OK
    </button>
  );
});

function renderResetPasswordPage({ token = 'valid-uuid-token' }: { token?: string } = {}) {
  const renderWithProviders = createTestProviderFactory();
  const route = token ? `/reset-password/${token}` : '/reset-password';

  return renderWithProviders(
    <Routes>
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/reset-password-error" element={<ResetPasswordErrorPage />} />
      <Route path="/reset-password-expired" element={<ResetPasswordExpiredPage />} />
    </Routes>,
    {
      route,
    }
  );
}

describe('ResetPasswordPage', () => {
  const mockExecute = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the use case to return success by default
    const {
      ValidateResetTokenUseCase,
    } = require('@application/use-cases/auth/ValidateResetTokenUseCase');
    ValidateResetTokenUseCase.mockImplementation(() => ({
      execute: mockExecute,
    }));

    // Mock the repository
    const { AuthApiRepository } = require('@infrastructure/api/auth/AuthApiRepository');
    AuthApiRepository.mockImplementation(() => ({}));

    // Default success response
    mockExecute.mockResolvedValue({
      success: true,
      data: { isValid: true, isExpired: false, userExists: true },
    });
  });

  it('should render the title when token is valid', async () => {
    renderResetPasswordPage({
      token: '1234567890123456789012345678901234567890123456789012345678901234',
    });

    await waitFor(() => {
      expect(screen.getByTestId('reset-password-title')).toBeInTheDocument();
    });
  });

  it('should render content correctly with valid token', async () => {
    const { asFragment } = renderResetPasswordPage({
      token: '1234567890123456789012345678901234567890123456789012345678901234',
    });

    await waitFor(() => {
      expect(screen.getByTestId('reset-password-title')).toBeInTheDocument();
    });
    // Rendered button from mocked ResetPasswordForm should be present
    expect(screen.getByTestId('trigger-success')).toBeInTheDocument();
    expect(asFragment()).toBeDefined();
  });

  it('should not render when route does not match', () => {
    const renderWithProviders = createTestProviderFactory();
    const { container } = renderWithProviders(
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Routes>,
      {
        route: '/otra-ruta',
      }
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('redirects immediately when no token param is present (lines 25-26)', async () => {
    const renderWithProviders = createTestProviderFactory();
    renderWithProviders(
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password-error" element={<ResetPasswordErrorPage />} />
      </Routes>,
      { route: '/reset-password' }
    );

    await waitFor(() => {
      expect(screen.getByTestId('reset-password-error-title')).toBeInTheDocument();
    });
  });

  it('should not render title when token is empty', async () => {
    renderResetPasswordPage({ token: '' });
    // Component redirects immediately, so no content should be rendered
    await waitFor(() => {
      expect(screen.queryByTestId('reset-password-title')).not.toBeInTheDocument();
    });
  });

  it('should not render title when token is invalid format', async () => {
    renderResetPasswordPage({ token: 'invalid-token' });
    // Component redirects immediately, so no content should be rendered
    await waitFor(() => {
      expect(screen.queryByTestId('reset-password-title')).not.toBeInTheDocument();
    });
  });

  it('should redirect to expired page when token is expired', async () => {
    // Mock expired token response
    mockExecute.mockResolvedValue({
      success: false,
      data: { isValid: false, isExpired: true, userExists: true },
    });

    renderResetPasswordPage({
      token: '1234567890123456789012345678901234567890123456789012345678901234',
    });

    await waitFor(() => {
      expect(screen.getByTestId('reset-password-expired-title')).toBeInTheDocument();
    });
  });

  it('shows loading state while validating token', async () => {
    // Keep promise pending to observe loading UI
    mockExecute.mockImplementationOnce(
      () =>
        new Promise(() => {
          /* never resolve in this test */
        })
    );

    const { unmount } = renderResetPasswordPage({
      token: '1234567890123456789012345678901234567890123456789012345678901234',
    });

    // Immediately after render, loading title should be visible
    expect(screen.getByTestId('reset-password-loading-title')).toBeInTheDocument();
    unmount();
  });

  it('redirects to error page on unexpected exception', async () => {
    mockExecute.mockRejectedValueOnce(new Error('network error'));

    renderResetPasswordPage({
      token: '1234567890123456789012345678901234567890123456789012345678901234',
    });

    await waitFor(() => {
      expect(screen.getByTestId('reset-password-error-title')).toBeInTheDocument();
    });
  });

  it('redirects to error page when token is invalid and not expired', async () => {
    mockExecute.mockResolvedValueOnce({
      success: true,
      data: { isValid: false, isExpired: false, userExists: true },
    });

    renderResetPasswordPage({
      token: '1234567890123456789012345678901234567890123456789012345678901234',
    });

    await waitFor(() => {
      expect(screen.getByTestId('reset-password-error-title')).toBeInTheDocument();
    });
  });

  it('navigates to success page when form triggers onSuccess', async () => {
    // Ensure validation is successful so form is rendered
    mockExecute.mockResolvedValueOnce({
      success: true,
      data: { isValid: true, isExpired: false, userExists: true },
    });

    const { createTestProviderFactory } = require('@shared/utils/renderProvider');
    const ResetPasswordSuccessPage = require('@ui/pages/ResetPasswordSuccessPage').default;
    const ResetPasswordPageLocal = require('@ui/pages/ResetPasswordPage').default;
    const renderWithProviders = createTestProviderFactory();

    renderWithProviders(
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPasswordPageLocal />} />
        <Route path="/reset-password-success" element={<ResetPasswordSuccessPage />} />
      </Routes>,
      {
        route: '/reset-password/1234567890123456789012345678901234567890123456789012345678901234',
      }
    );

    // Wait until form is rendered as a button in this mock, then click
    await waitFor(() => expect(screen.getByTestId('trigger-success')).toBeInTheDocument());
    screen.getByTestId('trigger-success').click();

    await waitFor(() => {
      expect(screen.getByTestId('reset-password-success-title')).toBeInTheDocument();
    });
  });
});
