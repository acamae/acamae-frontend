import { configureStore, Store } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import rootReducer from '@application/state/rootReducer';
import { RootState } from '@domain/types/redux';
import i18n from '@infrastructure/i18n';

type TestProviderOptions = {
  preloadedState?: Partial<RootState>;
  store?: Store;
  route?: string;
  i18nInstance?: typeof i18n;
  withRouter?: boolean;
  withI18n?: boolean;
};

export function createTestProviderFactory(defaults: Partial<TestProviderOptions> = {}) {
  return function renderWithProviders(ui: React.ReactElement, options: TestProviderOptions = {}) {
    const {
      preloadedState = {},
      store = configureStore({ reducer: rootReducer, preloadedState }),
      route = '/',
      i18nInstance = i18n,
      withRouter = true,
      withI18n = true,
    } = { ...defaults, ...options };

    let tree = <Provider store={store}>{ui}</Provider>;
    if (withI18n) {
      tree = <I18nextProvider i18n={i18nInstance}>{tree}</I18nextProvider>;
    }
    if (withRouter) {
      tree = <MemoryRouter initialEntries={[route]}>{tree}</MemoryRouter>;
    }
    return render(tree);
  };
}
