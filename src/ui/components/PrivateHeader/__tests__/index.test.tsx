import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { AuthState } from '@domain/types/auth';
import i18n from '@infrastructure/i18n';
import es from '@infrastructure/i18n/locales/es-ES.json';
import { APP_ROUTES } from '@shared/constants/appRoutes';
import { makeTestStore } from '@shared/utils/reduxTestUtils';
import PrivateHeader from '@ui/components/PrivateHeader';
import { useAuth } from '@ui/hooks/useAuth';

// Mockear useAuth
const mockLogoutFn = jest.fn();
const mockLoginFn = jest.fn();
const mockRegisterFn = jest.fn();

jest.mock('@ui/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: '1', username: 'testuser', email: 'test@example.com', role: 'user' },
    isAuthenticated: true,
    loading: false,
    error: null,
    login: mockLoginFn,
    register: mockRegisterFn,
    logout: mockLogoutFn,
  })),
}));

// Mockear LanguageSelector
jest.mock('@ui/components/LanguageSelector', () => {
  const MockLanguageSelector = () => <div data-testid="mock-language-selector"></div>;
  MockLanguageSelector.displayName = 'MockLanguageSelector';
  return MockLanguageSelector;
});

// Configuración del mock store de Redux
const baseAuthState: AuthState = {
  isAuthenticated: true,
  user: { id: '1', username: 'testuser', email: 'test@example.com', role: 'user' },
  token: null,
  expiresAt: null,
  loading: false,
};

describe('PrivateHeader', () => {
  const setup = (initialAuthState: Partial<AuthState> = {}) => {
    const fullAuthState = { ...baseAuthState, ...initialAuthState };
    const store = makeTestStore({
      auth: {
        ...fullAuthState,
        _persist: { version: 1, rehydrated: true },
      },
    });
    return render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <PrivateHeader />
          </MemoryRouter>
        </I18nextProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockClear();
    mockLogoutFn.mockClear();
    mockLoginFn.mockClear();
    mockRegisterFn.mockClear();

    (useAuth as jest.Mock).mockImplementation(() => ({
      user: { id: '1', username: 'testuser', email: 'test@example.com', role: 'user' },
      isAuthenticated: true,
      loading: false,
      error: null,
      login: mockLoginFn,
      register: mockRegisterFn,
      logout: mockLogoutFn,
    }));
  });

  it('should render the app name as a link to the dashboard', () => {
    setup();
    const appNameLink = screen.getByTestId('link-dashboard');
    expect(appNameLink).toBeInTheDocument();
    expect(appNameLink).toHaveTextContent(es.app.name);
    expect(appNameLink).toHaveAttribute('href', APP_ROUTES.DASHBOARD);
  });

  it('should render the mocked LanguageSelector', () => {
    setup();
    expect(screen.getByTestId('mock-language-selector')).toBeInTheDocument();
  });

  it('should render navigation links correctly', () => {
    setup();
    const profileLink = screen.getByTestId('link-profile');
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveTextContent(es.nav.profile);
    expect(profileLink).toHaveAttribute('href', APP_ROUTES.PROFILE);

    const teamsLink = screen.getByTestId('link-teams');
    expect(teamsLink).toBeInTheDocument();
    expect(teamsLink).toHaveTextContent(es.nav.teams);
    expect(teamsLink).toHaveAttribute('href', APP_ROUTES.TEAMS);
  });

  it('should render logout button and call logout on click', () => {
    setup();
    const logoutButton = screen.getByTestId('btn-logout');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveTextContent(es.nav.logout);

    fireEvent.click(logoutButton);
    expect(mockLogoutFn).toHaveBeenCalledTimes(1);
  });
});
