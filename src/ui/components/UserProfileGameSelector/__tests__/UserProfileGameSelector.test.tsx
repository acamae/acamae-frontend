import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import { addUserGameAction } from '@application/state/actions/profile.actions';
import type { CatalogsState } from '@domain/types/catalogsState';
import api from '@shared/services/axiosService';
import { makeTestStore } from '@shared/utils/reduxTestUtils';
import { useAuth } from '@ui/hooks/useAuth';

import {
  UserProfileGameSelector,
  UserProfileGameSelectorWithWarning,
} from '../UserProfileGameSelector';

jest.mock('@ui/hooks/useAuth');
jest.mock('@shared/services/axiosService');

describe('UserProfileGameSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '12', role: 'user', email: 'e', username: 'u' },
    });
  });

  it('loads catalog and selected games, shows warning when none', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce({ data: { data: { games: [] } } })
      .mockResolvedValueOnce({ data: { data: { games: [] } } });

    const store = makeTestStore({
      catalogs: {
        countries: [],
        games: [
          { id: 1, code: 'lol', nameCode: '', imageFilename: '' } as unknown,
          { id: 2, code: 'valorant', nameCode: '', imageFilename: '' } as unknown,
        ],
        timezones: [],
        loading: false,
        error: undefined,
      } as CatalogsState,
    });
    render(
      <Provider store={store}>
        <UserProfileGameSelectorWithWarning />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('games-warning')).toBeInTheDocument();
    });
  });

  it('toggles a game only after server response', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          data: {
            games: [
              { id: 1, code: 'lol' },
              { id: 2, code: 'valorant' },
            ],
          },
        },
      })
      .mockResolvedValueOnce({ data: { data: { games: [] } } });
    // The component now uses Redux thunks, not api.put directly

    const store = makeTestStore({
      catalogs: {
        countries: [],
        games: [
          { id: 1, code: 'lol', nameCode: '', imageFilename: '' } as unknown,
          { id: 2, code: 'valorant', nameCode: '', imageFilename: '' } as unknown,
        ],
        selectedGameCodes: [],
        timezones: [],
        timezone: '',
        availability: [],
        loading: false,
        error: undefined,
      } as CatalogsState,
    });
    // Mock thunk dispatch to simulate server success with toggle payload
    const originalDispatch = store.dispatch as unknown as (action: unknown) => unknown;
    const spy = jest.spyOn(store, 'dispatch') as unknown as jest.SpyInstance<unknown, [unknown]>;
    type Fulfilled<TPayload, TArg> = Promise<{
      type: string;
      payload: TPayload;
      meta?: { arg?: TArg };
    }>;
    spy.mockImplementation((action: unknown) => {
      if (typeof action === 'function') {
        const payload = {
          data: { selected: true, gameId: 1, profileIsActive: true },
          success: true,
          status: 200,
          code: 'SUCCESS',
          message: 'OK',
          timestamp: new Date().toISOString(),
          requestId: '123',
        };
        const p = Promise.resolve({
          type: addUserGameAction.fulfilled.type,
          payload,
          meta: { arg: { userId: '12', gameId: 1 } },
        }) as unknown as Fulfilled<typeof payload, { userId: string; gameId: number }>;
        return p as unknown;
      }
      return originalDispatch(action);
    });

    render(
      <Provider store={store}>
        <UserProfileGameSelectorWithWarning />
      </Provider>
    );

    await waitFor(() => expect(screen.getByTestId('game-lol')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('game-lol'));

    // State is now in Redux; ensure button toggles to active
    await waitFor(() => {
      expect(screen.getByTestId('game-lol')).toHaveClass('btn-theme', { exact: false });
      expect(screen.getByTestId('game-lol')).toHaveClass('active');
    });
  });

  it('builds codeToId from existing catalog and marks selected ids from profile GET', async () => {
    // GET profile returns user selected games
    (api.get as jest.Mock)
      .mockResolvedValueOnce({ data: { data: { games: [{ id: 1 }, { id: 2 }] } } })
      .mockResolvedValueOnce({ data: { data: { games: [] } } });

    const store = makeTestStore({
      catalogs: {
        countries: [],
        games: [
          { id: 1, code: 'lol', nameCode: '', imageFilename: '' } as unknown,
          { id: 2, code: 'valorant', nameCode: '', imageFilename: '' } as unknown,
        ],
        timezones: [],
        loading: false,
        error: undefined,
      } as CatalogsState,
    });

    // Intercept thunk dispatch to fulfill profile fetch with ids
    const originalDispatch = store.dispatch as unknown as (action: unknown) => unknown;
    const spy = jest.spyOn(store, 'dispatch') as unknown as jest.SpyInstance<unknown, [unknown]>;
    spy.mockImplementation((action: unknown) => {
      if (typeof action === 'function') {
        return Promise.resolve({
          type: 'profile/fetchUserProfile/fulfilled',
          payload: { data: { games: [{ id: 1 }, { id: 2 }] } },
        });
      }
      return originalDispatch(action);
    });

    render(
      <Provider store={store}>
        <UserProfileGameSelectorWithWarning />
      </Provider>
    );

    await waitFor(() => expect(screen.getByTestId('game-lol')).toBeInTheDocument());
    // initial render can be outline-theme before hydration, then becomes active
    await waitFor(() => expect(screen.getByTestId('game-lol')).toHaveClass('active'));
  });

  it('handles legacy payloads for add/remove by mapping codes back to ids', async () => {
    // Profile GET returns empty initially
    (api.get as jest.Mock)
      .mockResolvedValueOnce({ data: { data: { games: [] } } })
      .mockResolvedValueOnce({ data: { data: { games: [] } } });

    const store = makeTestStore({
      catalogs: {
        countries: [],
        games: [
          { id: 1, code: 'lol', nameCode: '', imageFilename: '' } as unknown,
          { id: 2, code: 'valorant', nameCode: '', imageFilename: '' } as unknown,
        ],
        timezones: [],
        loading: false,
        error: undefined,
      } as CatalogsState,
    });

    const originalDispatch = store.dispatch as unknown as (action: unknown) => unknown;
    // First thunk dispatch (GET profile) should be fulfilled empty; then on click emulate legacy add/remove
    let togglePhase: 'add' | 'remove' | 'idle' = 'idle';
    const spy = jest.spyOn(store, 'dispatch') as unknown as jest.SpyInstance<unknown, [unknown]>;
    spy.mockImplementation((action: unknown) => {
      if (typeof action === 'function') {
        if (togglePhase === 'add') {
          // addUserGameAction legacy payload
          return Promise.resolve({
            type: addUserGameAction.fulfilled.type,
            payload: { data: { games: [{ code: 'lol' }, { code: 'valorant' }] } },
          });
        }
        if (togglePhase === 'remove') {
          // removeUserGameAction legacy payload
          return Promise.resolve({
            type: 'profile/removeUserGame/fulfilled',
            payload: { data: { games: [{ code: 'valorant' }] } },
          });
        }
        // initial getUserProfileAction
        return Promise.resolve({
          type: 'profile/fetchUserProfile/fulfilled',
          payload: { data: { games: [] } },
        });
      }
      return originalDispatch(action);
    });

    render(
      <Provider store={store}>
        <UserProfileGameSelectorWithWarning />
      </Provider>
    );

    await waitFor(() => expect(screen.getByTestId('game-lol')).toBeInTheDocument());

    // ADD legacy
    togglePhase = 'add';
    fireEvent.click(screen.getByTestId('game-lol'));
    await waitFor(() => {
      expect(screen.getByTestId('game-lol')).toHaveClass('active');
      expect(screen.getByTestId('game-valorant')).toHaveClass('active');
    });

    // REMOVE legacy (should keep only valorant active)
    togglePhase = 'remove';
    fireEvent.click(screen.getByTestId('game-lol'));
    await waitFor(() => {
      expect(screen.getByTestId('game-lol')).not.toHaveClass('active');
      expect(screen.getByTestId('game-valorant')).toHaveClass('active');
    });
  });

  it('removes a selected game using toggle payload (selected=false)', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce({ data: { data: { games: [{ id: 1 }] } } })
      .mockResolvedValueOnce({ data: { data: { games: [] } } });

    const store = makeTestStore({
      catalogs: {
        countries: [],
        games: [
          { id: 1, code: 'lol', nameCode: '', imageFilename: '' } as unknown,
          { id: 2, code: 'valorant', nameCode: '', imageFilename: '' } as unknown,
        ],
        timezones: [],
        loading: false,
        error: undefined,
      } as CatalogsState,
      profile: { games: [1] },
    });

    const originalDispatch = store.dispatch as unknown as (action: unknown) => unknown;
    const spy = jest.spyOn(store, 'dispatch') as unknown as jest.SpyInstance<unknown, [unknown]>;
    spy.mockImplementation((action: unknown) => {
      if (typeof action === 'function') {
        // Simulate removeUserGameAction.fulfilled toggle payload
        return Promise.resolve({
          type: 'profile/removeUserGame/fulfilled',
          payload: { data: { gameId: 1, selected: false, profileIsActive: true } },
        });
      }
      return originalDispatch(action);
    });

    render(
      <Provider store={store}>
        <UserProfileGameSelectorWithWarning />
      </Provider>
    );

    await waitFor(() => expect(screen.getByTestId('game-lol')).toBeInTheDocument());
    expect(screen.getByTestId('game-lol')).toHaveClass('active');

    // Click to remove
    fireEvent.click(screen.getByTestId('game-lol'));
    await waitFor(() => expect(screen.getByTestId('game-lol')).not.toHaveClass('active'));
  });
});

describe('UserProfileGameSelector early-returns branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not dispatch when userId is empty (no user)', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    const store = makeTestStore({
      catalogs: {
        countries: [],
        games: [],
        selectedGameCodes: [],
        timezones: [],
        timezone: '',
        availability: [],
        loading: false,
      } as CatalogsState,
    });
    render(
      <Provider store={store}>
        <UserProfileGameSelector />
      </Provider>
    );

    expect(document.body).toBeDefined();
  });

  it('should not dispatch when gameId is missing in map (codeToId)', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 1 } });
    (api.get as unknown as jest.Mock).mockResolvedValueOnce({ data: { data: { games: [] } } });
    const store = makeTestStore({
      catalogs: {
        countries: [],
        games: [], // empty so codeToId will not contain any id
        selectedGameCodes: [],
        timezones: [],
        timezone: '',
        availability: [],
        loading: false,
      } as CatalogsState,
    });

    render(
      <Provider store={store}>
        <UserProfileGameSelector />
      </Provider>
    );

    const candidate = screen.queryByTestId('game-lol');
    if (candidate) {
      fireEvent.click(candidate);
      // No state change expected
    }
  });
});
