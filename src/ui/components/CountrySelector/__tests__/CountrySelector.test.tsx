import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import { CatalogsState } from '@domain/types/catalogsState';
import { makeTestStore } from '@shared/utils/reduxTestUtils';
import { useAuth } from '@ui/hooks/useAuth';

import { CountrySelector } from '../CountrySelector';

jest.mock('@ui/hooks/useAuth');

describe('CountrySelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '12', username: 'alice', email: 'a@a.com', role: 'user' },
    });
  });

  function setup(catalog: Partial<CatalogsState> = {}) {
    const store = makeTestStore({
      auth: {
        // Provide a user id so CountrySelector can persist
        user: { id: '12', email: 'a@a.com', username: 'alice', role: 'user' },
        token: null,
        isAuthenticated: false,
        expiresAt: null,
        loading: false,
      },
      catalogs: {
        countries: [{ code: 'AR', name: 'Argentina' }] as unknown[],
        games: [],
        timezones: [],
        loading: false,
        error: undefined,
        ...catalog,
      } as CatalogsState,
    });
    return store;
  }

  it('shows warning when country is missing, hides after selecting and successful PUT returning string code', async () => {
    const store = setup();
    const originalDispatch = store.dispatch as unknown as (action: unknown) => unknown;
    const spy = jest.spyOn(store, 'dispatch') as unknown as jest.SpyInstance<unknown, [unknown]>;
    type Unwrappable<T> = Promise<{ type: string; payload: T }> & { unwrap: () => Promise<T> };
    spy.mockImplementation((action: unknown) => {
      if (typeof action === 'function') {
        // CountrySelector no dispara fetch de perfil; devolver directamente el PUT con unwrap()
        const resp = { data: { country: 'AR' } };
        const p = Promise.resolve({
          type: 'profile/putCountry/fulfilled',
          payload: resp,
        }) as unknown as Unwrappable<typeof resp>;
        p.unwrap = () => Promise.resolve(resp);
        return p as unknown;
      }
      return originalDispatch(action);
    });

    render(
      <Provider store={store}>
        <CountrySelector />
      </Provider>
    );

    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    // Warning visible initially
    expect(screen.getByTestId('country-warning')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'AR' } });

    await waitFor(() => {
      // Warning hidden
      expect(screen.queryByTestId('country-warning')).toBeNull();
      // Value remains selected
      expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('AR');
    });
  });

  it('keeps empty selection and shows warning when PUT returns empty (null-like)', async () => {
    const store = setup();
    const originalDispatch = store.dispatch as unknown as (action: unknown) => unknown;
    const spy = jest.spyOn(store, 'dispatch') as unknown as jest.SpyInstance<unknown, [unknown]>;
    type Unwrappable<T> = Promise<{ type: string; payload: T }> & { unwrap: () => Promise<T> };
    spy.mockImplementation((action: unknown) => {
      if (typeof action === 'function') {
        const resp = { data: { country: '' } };
        const p = Promise.resolve({
          type: 'profile/putCountry/fulfilled',
          payload: resp,
        }) as unknown as Unwrappable<typeof resp>;
        p.unwrap = () => Promise.resolve(resp);
        return p as unknown;
      }
      return originalDispatch(action);
    });

    render(
      <Provider store={store}>
        <CountrySelector />
      </Provider>
    );

    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });

    await waitFor(() => {
      expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('');
      expect(screen.getByTestId('country-warning')).toBeInTheDocument();
    });
  });

  it('shows warning and keeps empty on rejected PUT', async () => {
    const store = setup();
    const originalDispatch = store.dispatch as unknown as (action: unknown) => unknown;
    const spy = jest.spyOn(store, 'dispatch') as unknown as jest.SpyInstance<unknown, [unknown]>;
    type Unwrappable<T> = Promise<{
      type: string;
      payload: T;
      meta: { rejectedWithValue: boolean };
    }> & {
      unwrap: () => Promise<T>;
    };
    spy.mockImplementation((action: unknown) => {
      if (typeof action === 'function') {
        const payload = { message: 'Validation error' };
        const p = Promise.resolve({
          type: 'profile/putCountry/rejected',
          payload,
          meta: { rejectedWithValue: true },
        }) as unknown as Unwrappable<typeof payload>;
        p.unwrap = () => Promise.reject(payload);
        return p as unknown;
      }
      return originalDispatch(action);
    });

    render(
      <Provider store={store}>
        <CountrySelector />
      </Provider>
    );

    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });

    await waitFor(() => {
      expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('');
      expect(screen.getByTestId('country-warning')).toBeInTheDocument();
    });
  });
});
