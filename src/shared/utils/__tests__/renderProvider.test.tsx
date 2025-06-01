import { configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import rootReducer from '@application/state/rootReducer';
import i18n from '@infrastructure/i18n';
import { createTestProviderFactory } from '@shared/utils/renderProvider';

describe('createTestProviderFactory', () => {
  const renderWithProviders = createTestProviderFactory();

  it('renders children with all providers by default', () => {
    renderWithProviders(<div data-testid="test-div">Hola</div>);
    expect(screen.getByTestId('test-div')).toBeInTheDocument();
  });

  it('renders only with Redux provider when withRouter and withI18n are false', () => {
    renderWithProviders(<div data-testid="redux-only">Redux</div>, {
      withRouter: false,
      withI18n: false,
    });
    expect(screen.getByTestId('redux-only')).toBeInTheDocument();
  });

  it('renders with Router provider only', () => {
    renderWithProviders(<div data-testid="router-only">Router</div>, {
      withI18n: false,
    });
    expect(screen.getByTestId('router-only')).toBeInTheDocument();
  });

  it('renders with I18n provider only', () => {
    renderWithProviders(<div data-testid="i18n-only">I18n</div>, {
      withRouter: false,
    });
    expect(screen.getByTestId('i18n-only')).toBeInTheDocument();
  });

  it('accepts a custom store', () => {
    const customStore = configureStore({ reducer: rootReducer });
    renderWithProviders(<div data-testid="custom-store">Store</div>, { store: customStore });
    expect(screen.getByTestId('custom-store')).toBeInTheDocument();
  });

  it('accepts preloadedState', () => {
    renderWithProviders(<div data-testid="preloaded">Preloaded</div>, {
      preloadedState: {
        auth: {
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user',
          },
          isAuthenticated: true,
          token: 'mock-token',
          expiresAt: (Date.now() + 10000).toString(),
          loading: false,
          error: null,
          _persist: {
            version: 1,
            rehydrated: true,
          },
        },
      },
    });
    expect(screen.getByTestId('preloaded')).toBeInTheDocument();
  });

  it('accepts a custom route', () => {
    renderWithProviders(<div data-testid="route">Route</div>, { route: '/custom' });
    expect(screen.getByTestId('route')).toBeInTheDocument();
  });

  it('accepts a custom i18n instance', () => {
    const customI18n = { ...i18n, language: 'fr' };
    renderWithProviders(<div data-testid="i18n-instance">I18nInstance</div>, {
      i18nInstance: customI18n,
    });
    expect(screen.getByTestId('i18n-instance')).toBeInTheDocument();
  });

  it('throws if store is invalid', () => {
    // @ts-expect-error intentionally passing null to test error handling
    expect(() => renderWithProviders(<div />, { store: null })).toThrow();
  });

  it('does not throw if i18nInstance is invalid', () => {
    // @ts-expect-error intentionally passing null to test i18nInstance handling
    expect(() => renderWithProviders(<div />, { i18nInstance: null })).not.toThrow();
  });
});
