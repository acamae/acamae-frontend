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

jest.mock('@infrastructure/api/AuthApiRepository', () => ({
  AuthApiRepository: jest.fn(),
}));

jest.mock('@ui/components/Forms/ResetPasswordForm', () => {
  const MockResetPasswordForm = () => (
    <div data-testid="mock-reset-password-form">Mocked Reset Password Form</div>
  );
  return MockResetPasswordForm;
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
    const { AuthApiRepository } = require('@infrastructure/api/AuthApiRepository');
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

  it('should render snapshot correctly with valid token', async () => {
    const { asFragment } = renderResetPasswordPage({
      token: '1234567890123456789012345678901234567890123456789012345678901234',
    });

    await waitFor(() => {
      expect(screen.getByTestId('reset-password-title')).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
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
});
