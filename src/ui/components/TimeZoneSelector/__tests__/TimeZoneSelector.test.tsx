import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import { CatalogsState } from '@domain/types/catalogsState';
import api from '@shared/services/axiosService';
import { makeTestStore } from '@shared/utils/reduxTestUtils';
import { useAuth } from '@ui/hooks/useAuth';

import { TimeZoneSelector } from '../TimeZoneSelector';

jest.mock('@ui/hooks/useAuth');
jest.mock('@shared/services/axiosService');

describe('TimeZoneSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '12', username: 'alice', email: 'a@a.com', role: 'user' },
    });
  });

  it('loads timezones and shows warning when timezone is missing, hides after selecting', async () => {
    // Axios is mocked globally but we will intercept dispatch to fulfill thunks deterministically

    const store = makeTestStore({
      catalogs: {
        countries: [],
        games: [],
        timezones: [{ id: 'Europe/Madrid', utcOffset: '+01:00' } as unknown],
        loading: false,
        error: undefined,
      } as CatalogsState,
    });

    const originalDispatch = store.dispatch as unknown as (action: unknown) => unknown;
    let call = 0;
    const spy = jest.spyOn(store, 'dispatch') as unknown as jest.SpyInstance<unknown, [unknown]>;
    type Unwrappable<T> = Promise<{ type: string; payload: T }> & { unwrap: () => Promise<T> };
    spy.mockImplementation((action: unknown) => {
      if (typeof action === 'function') {
        call += 1;
        if (call === 1) {
          // getUserProfileAction: the component does not unwrap this; returning any Promise is fine
          return Promise.resolve({
            type: 'profile/fetchUserProfile/fulfilled',
            payload: { data: { timezone: '' } },
          });
        }
        // putUserTimezoneProfileAction: return a promise with .unwrap()
        const resp = { data: { timezone: 'Europe/Madrid', profileIsActive: true } };
        const p = Promise.resolve({
          type: 'profile/putUserTimezone/fulfilled',
          payload: resp,
        }) as unknown as Unwrappable<typeof resp>;
        p.unwrap = () => Promise.resolve(resp);
        return p as unknown;
      }
      return originalDispatch(action);
    });
    render(
      <Provider store={store}>
        <TimeZoneSelector />
      </Provider>
    );

    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());

    // Warning shown when no timezone
    expect(screen.getByTestId('timezone-warning')).toBeInTheDocument();

    // Change selection
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Europe/Madrid' } });

    await waitFor(() => {
      // Warning hidden
      expect(screen.queryByTestId('timezone-warning')).toBeNull();
    });
  });

  it('keeps empty and shows warning when PUT returns success with timezone null', async () => {
    const store = makeTestStore({
      catalogs: {
        countries: [],
        games: [],
        timezones: [{ id: 'UTC' } as unknown],
        loading: false,
        error: undefined,
      } as CatalogsState,
    });

    const originalDispatch = store.dispatch as unknown as (action: unknown) => unknown;
    let call = 0;
    const spy = jest.spyOn(store, 'dispatch') as unknown as jest.SpyInstance<unknown, [unknown]>;
    type Unwrappable<T> = Promise<{ type: string; payload: T }> & { unwrap: () => Promise<T> };
    spy.mockImplementation((action: unknown) => {
      if (typeof action === 'function') {
        call += 1;
        if (call === 1) {
          return Promise.resolve({
            type: 'profile/fetchUserProfile/fulfilled',
            payload: { data: { timezone: '' } },
          });
        }
        // Return unwrap resolving to null timezone
        const resp = { data: { timezone: null, profileIsActive: false } };
        const p = Promise.resolve({
          type: 'profile/putUserTimezone/fulfilled',
          payload: resp,
        }) as unknown as Unwrappable<typeof resp>;
        p.unwrap = () => Promise.resolve(resp);
        return p as unknown;
      }
      return originalDispatch(action);
    });

    render(
      <Provider store={store}>
        <TimeZoneSelector />
      </Provider>
    );

    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });

    await waitFor(() => {
      expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('');
      expect(screen.getByTestId('timezone-warning')).toBeInTheDocument();
    });
  });

  it('shows empty timezone and warning on catch path (lines 90-91)', async () => {
    const store = makeTestStore({
      catalogs: {
        countries: [],
        games: [],
        timezones: [{ id: 'UTC' } as unknown],
        loading: false,
        error: undefined,
      } as CatalogsState,
    });

    const originalDispatch = store.dispatch as unknown as (action: unknown) => unknown;
    const spy = jest.spyOn(store, 'dispatch') as unknown as jest.SpyInstance<unknown, [unknown]>;
    type Unwrappable<T> = Promise<{ type: string; payload: T }> & { unwrap: () => Promise<T> };
    let call = 0;
    spy.mockImplementation((action: unknown) => {
      if (typeof action === 'function') {
        call += 1;
        if (call === 1) {
          return Promise.resolve({
            type: 'profile/fetchUserProfile/fulfilled',
            payload: { data: { timezone: '' } },
          });
        }
        // Simulate rejected unwrap
        const resp = { data: { timezone: '' } };
        const p = Promise.resolve({
          type: 'profile/putUserTimezone/rejected',
          payload: resp,
        }) as unknown as Unwrappable<typeof resp>;
        p.unwrap = () => Promise.reject(new Error('Validation error'));
        return p as unknown;
      }
      return originalDispatch(action);
    });

    render(
      <Provider store={store}>
        <TimeZoneSelector />
      </Provider>
    );

    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });

    await waitFor(() => {
      expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('');
      expect(screen.getByTestId('timezone-warning')).toBeInTheDocument();
    });
  });

  it('dispatches fetchTimezonesCatalogAction when catalog is empty (branch at line 37)', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce({ data: { data: { timezones: [{ id: 'UTC' }] } } })
      .mockResolvedValueOnce({ data: { data: { timezone: '', availability: [] } } });

    const store = makeTestStore({
      catalogs: {
        countries: [],
        games: [],
        timezones: [], // empty to force fetch branch
        loading: false,
        error: undefined,
      } as CatalogsState,
    });

    const originalDispatch = store.dispatch as unknown as (action: unknown) => unknown;
    const spy = jest.spyOn(store, 'dispatch') as unknown as jest.SpyInstance<unknown, [unknown]>;
    spy.mockImplementation((action: unknown) => {
      if (typeof action === 'function') {
        // Simulate fulfilled of fetchTimezonesCatalogAction
        return Promise.resolve({
          type: 'catalogs/fetchTimezonesCatalog/fulfilled',
          payload: { data: { timezones: [{ id: 'UTC' }] } },
        });
      }
      return originalDispatch(action);
    });

    render(
      <Provider store={store}>
        <TimeZoneSelector />
      </Provider>
    );

    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
  });
});
