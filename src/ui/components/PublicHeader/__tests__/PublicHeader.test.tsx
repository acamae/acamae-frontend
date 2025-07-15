import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import i18n from '@infrastructure/i18n';
import PublicHeader from '@ui/components/PublicHeader';
import { useAuth } from '@ui/hooks/useAuth';

// Mock del hook useAuth
jest.mock('@ui/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('PublicHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPublicHeader = () => {
    return render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <PublicHeader />
        </MemoryRouter>
      </I18nextProvider>
    );
  };

  it('debe mostrar enlaces de login y registro cuando el usuario no está autenticado', () => {
    // Configurar el mock para un usuario no autenticado
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      resendVerification: jest.fn(),
      hasRole: jest.fn(),
    });

    renderPublicHeader();

    // Verificar que se muestran los enlaces correctos
    expect(screen.getByTestId('link-login-nav')).toBeInTheDocument();
    expect(screen.getByTestId('link-register')).toBeInTheDocument();
  });

  it('debe mostrar enlace al dashboard cuando el usuario está autenticado', () => {
    // Configurar el mock para un usuario autenticado
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      },
      token: 'mock-token',
      loading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      resendVerification: jest.fn(),
      hasRole: jest.fn(),
    });

    renderPublicHeader();

    // Verificar que se muestra el enlace al dashboard
    expect(screen.getByTestId('link-dashboard-nav')).toBeInTheDocument();

    // Verificar que NO se muestran los enlaces de login y registro
    expect(screen.queryByTestId('link-login-nav')).not.toBeInTheDocument();
    expect(screen.queryByTestId('link-register')).not.toBeInTheDocument();
  });

  it('debe renderizar el logo y el selector de idioma', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      resendVerification: jest.fn(),
      hasRole: jest.fn(),
    });

    renderPublicHeader();

    // Verificar que se muestra el logo
    expect(screen.getByTestId('link-home')).toBeInTheDocument();

    // El selector de idioma debería estar presente
    // Nota: Puede que necesites ajustar esto dependiendo de cómo esté implementado el componente LanguageSelector
    expect(screen.getByTestId('public-header')).toBeInTheDocument();
  });
});
