import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

import { AuthState } from '@domain/types/auth';
import i18n from '@infrastructure/i18n';
import es from '@infrastructure/i18n/locales/es-ES.json';
import { makeTestStore } from '@shared/utils/reduxTestUtils';
import PrivateRoute from '@ui/components/PrivateRoute';

// Mock component for testing
const MockProtectedComponent = () => <div data-testid="protected-content">Contenido Protegido</div>;

// Component to display the current location (for checking redirects)
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

// Base auth state, matching initialState of authSlice
const baseAuthState: AuthState = {
  isAuthenticated: true,
  user: null,
  token: null,
  expiresAt: null,
  loading: false,
};

// Configure the mock Redux store
describe('PrivateRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouterAndRedux = (
    partialInitialAuthState: Partial<AuthState>,
    initialEntries = ['/protected']
  ) => {
    // Create a complete auth state by merging the base with the partial test state
    const fullInitialAuthState: AuthState = {
      ...baseAuthState,
      ...partialInitialAuthState,
    };
    const store = makeTestStore({
      auth: {
        ...fullInitialAuthState,
        _persist: { version: 1, rehydrated: true },
      },
    });
    return render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter initialEntries={initialEntries}>
            <Routes>
              <Route path="/login" element={<LocationDisplay />} />
              <Route
                path="/protected"
                element={
                  <PrivateRoute>
                    <MockProtectedComponent />
                  </PrivateRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </I18nextProvider>
      </Provider>
    );
  };

  it('should show loading message when loading is true', () => {
    renderWithRouterAndRedux({ loading: true, isAuthenticated: false });
    expect(screen.getByTestId('session-checking')).toBeInTheDocument();
    expect(screen.getByText(es.session.checking)).toBeInTheDocument();
  });

  it('should render children when authenticated and not loading', () => {
    renderWithRouterAndRedux({
      isAuthenticated: true,
      user: { id: '1', username: 'test', email: 'test@example.com', role: 'user' },
    });
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should redirect to /login when not authenticated and not loading', () => {
    renderWithRouterAndRedux({ isAuthenticated: false });
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('location-display')).toHaveTextContent('/login');
  });
});
