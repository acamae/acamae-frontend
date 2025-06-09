import { render, screen } from '@testing-library/react';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Outlet } from 'react-router-dom';

// Mocks for pages (no children needed)
jest.mock('@ui/pages/HomePage', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-home-page">HomePage</div>,
}));
jest.mock('@ui/pages/LoginPage', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-login-page">LoginPage</div>,
}));
jest.mock('@ui/pages/RegisterPage', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-register-page">RegisterPage</div>,
}));
jest.mock('@ui/pages/ForgotPasswordPage', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-forgot-password-page">ForgotPasswordPage</div>,
}));
jest.mock('@ui/pages/ResetPasswordPage', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-reset-password-page">ResetPasswordPage</div>,
}));
jest.mock('@ui/pages/EmailVerificationSentPage', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="mock-email-verification-sent-page">EmailVerificationSentPage</div>
  ),
}));
jest.mock('@ui/pages/EmailVerificationSuccessPage', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="mock-email-verification-success-page">EmailVerificationSuccessPage</div>
  ),
}));
jest.mock('@ui/pages/EmailVerificationExpiredPage', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="mock-email-verification-expired-page">EmailVerificationExpiredPage</div>
  ),
}));
jest.mock('@ui/pages/EmailAlreadyVerifiedPage', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-email-already-verified-page">EmailAlreadyVerifiedPage</div>,
}));
jest.mock('@ui/pages/ResendVerificationPage', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-resend-verification-page">ResendVerificationPage</div>,
}));
jest.mock('@ui/pages/DashboardPage', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-dashboard-page">DashboardPage</div>,
}));
jest.mock('@ui/pages/NotFoundPage', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-not-found-page">NotFoundPage</div>,
}));

// Auth state type for the mock
type MockAuthState = {
  user: unknown;
  isAuthenticated: boolean;
  loading: boolean;
  error: unknown;
  login: () => void;
  register: () => void;
  logout: () => void;
};

let mockAuthReduxState: MockAuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: () => {},
  register: () => {},
  logout: () => {},
};

jest.mock('@ui/layouts/PublicLayout', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="mock-public-layout">
      <Outlet />
    </div>
  ),
}));
jest.mock('@ui/layouts/MainLayout', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="mock-main-layout">
      <Outlet />
    </div>
  ),
}));

// Mock useAuth hook
jest.mock('@/ui/hooks/useAuth', () => ({
  useAuth: jest.fn(() => mockAuthReduxState),
}));

jest.mock('@ui/components/PrivateRoute', () => {
  // Import useAuth from the already-mocked module
  const { useAuth } = require('@ui/hooks/useAuth');
  function MockPrivateRoute({ children }: { children?: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div data-testid="mock-private-route-loading">Loading...</div>;
    if (isAuthenticated) return <>{children}</>;
    return <div data-testid="mock-private-route-redirect">Redirected to Login</div>;
  }
  MockPrivateRoute.displayName = 'MockPrivateRoute';
  return { __esModule: true, default: MockPrivateRoute };
});

import i18n from '@infrastructure/i18n';
import { APP_ROUTES } from '@shared/constants/appRoutes';
import { useAuth } from '@ui/hooks/useAuth';
import AppRoutes from '@ui/routes';

describe('AppRoutes', () => {
  beforeEach(() => {
    mockAuthReduxState = {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      login: () => {},
      register: () => {},
      logout: () => {},
    };
    (useAuth as jest.Mock).mockImplementation(() => mockAuthReduxState);
  });

  /**
   * Renders the app routes with the given initial path and optional auth state.
   */
  const renderAppRoutes = (initialPath: string, authStateUpdate?: Partial<MockAuthState>) => {
    if (authStateUpdate) {
      mockAuthReduxState = { ...mockAuthReduxState, ...authStateUpdate };
      (useAuth as jest.Mock).mockImplementation(() => mockAuthReduxState);
    }
    return render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[initialPath]}>
          <AppRoutes />
        </MemoryRouter>
      </I18nextProvider>
    );
  };

  it('renders HomePage at root path with PublicLayout', () => {
    renderAppRoutes('/');
    expect(screen.getByTestId('mock-public-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mock-home-page')).toBeInTheDocument();
  });

  it('renders LoginPage at /login with PublicLayout', () => {
    renderAppRoutes('/login');
    expect(screen.getByTestId('mock-public-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mock-login-page')).toBeInTheDocument();
  });

  it('renders DashboardPage at /dashboard with MainLayout if authenticated', () => {
    renderAppRoutes(APP_ROUTES.DASHBOARD, { isAuthenticated: true, loading: false });
    expect(screen.getByTestId('mock-main-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mock-dashboard-page')).toBeInTheDocument();
  });

  it('redirects from /dashboard if not authenticated', () => {
    renderAppRoutes(APP_ROUTES.DASHBOARD, { isAuthenticated: false, loading: false });
    expect(screen.getByTestId('mock-main-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mock-private-route-redirect')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-dashboard-page')).not.toBeInTheDocument();
  });

  it('shows loading state for PrivateRoute if auth is loading', () => {
    renderAppRoutes(APP_ROUTES.DASHBOARD, { isAuthenticated: false, loading: true });
    expect(screen.getByTestId('mock-main-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mock-private-route-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-dashboard-page')).not.toBeInTheDocument();
  });

  it('renders NotFoundPage for unknown route', () => {
    renderAppRoutes('/unknown-route');
    expect(screen.getByTestId('mock-not-found-page')).toBeInTheDocument();
  });
});
