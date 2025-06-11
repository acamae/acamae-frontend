import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import i18n from '@infrastructure/i18n';
import es from '@infrastructure/i18n/locales/es-ES.json';
import PublicHeader from '@ui/components/PublicHeader';

jest.mock('@ui/components/LanguageSelector', () => {
  const MockLanguageSelector = () => <div data-testid="mock-language-selector"></div>;
  MockLanguageSelector.displayName = 'MockLanguageSelector';
  return MockLanguageSelector;
});

function renderPublicHeader() {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <PublicHeader />
      </MemoryRouter>
    </I18nextProvider>
  );
}

describe('PublicHeader', () => {
  it('should render app name as a link to home', () => {
    renderPublicHeader();
    const appNameLink = screen.getByTestId('link-home');
    expect(appNameLink).toBeInTheDocument();
    expect(appNameLink).toHaveTextContent(es.app.name);
    expect(appNameLink).toHaveAttribute('href', '/');
  });

  it('should render mocked LanguageSelector', () => {
    renderPublicHeader();
    expect(screen.getByTestId('mock-language-selector')).toBeInTheDocument();
  });

  it('should render login and register links correctly', () => {
    renderPublicHeader();
    const loginLink = screen.getByTestId('link-login-nav');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveTextContent(es.nav.login);
    expect(loginLink).toHaveAttribute('href', '/login');

    const registerLink = screen.getByTestId('link-register');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveTextContent(es.nav.register);
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should render snapshot correctly', () => {
    const { asFragment } = renderPublicHeader();
    expect(asFragment()).toMatchSnapshot();
  });
});
