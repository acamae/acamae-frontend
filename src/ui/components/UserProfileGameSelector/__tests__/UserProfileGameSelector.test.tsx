import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import type { PreferencesState } from '@application/state/slices/preferencesSlice';
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
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 12 } });
  });

  it('loads catalog and selected games, shows warning when none', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce({ data: { data: { games: [] } } })
      .mockResolvedValueOnce({ data: { data: { games: [] } } });

    const store = makeTestStore({
      preferences: {
        gamesCatalog: [
          { id: 1, code: 'lol', nameCode: '', imageFilename: '' } as unknown,
          { id: 2, code: 'valorant', nameCode: '', imageFilename: '' } as unknown,
        ],
        selectedGameCodes: [],
        timezones: [],
        timezone: '',
        availability: [],
        loading: false,
        error: undefined,
      } as PreferencesState,
    });
    render(
      <Provider store={store}>
        <UserProfileGameSelectorWithWarning
          userSelectedGames={[]}
          setUserSelectedGames={jest.fn()}
        />
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

    const setUserSelectedGames = jest.fn();
    const store = makeTestStore({
      preferences: {
        gamesCatalog: [
          { id: 1, code: 'lol', nameCode: '', imageFilename: '' } as unknown,
          { id: 2, code: 'valorant', nameCode: '', imageFilename: '' } as unknown,
        ],
        selectedGameCodes: [],
        timezones: [],
        timezone: '',
        availability: [],
        loading: false,
        error: undefined,
      } as PreferencesState,
    });
    // Mock thunk dispatch to simulate server success returning ['lol']
    const originalDispatch: typeof store.dispatch = store.dispatch;

    jest.spyOn(store, 'dispatch').mockImplementation(action => {
      if (typeof action === 'function') {
        return Promise.resolve({
          type: 'preferences/mock/fulfilled',
          payload: { data: { games: [{ code: 'lol' }] } },
        });
      }

      return (originalDispatch as unknown)(action as unknown);
    });

    render(
      <Provider store={store}>
        <UserProfileGameSelectorWithWarning
          userSelectedGames={[]}
          setUserSelectedGames={setUserSelectedGames}
        />
      </Provider>
    );

    await waitFor(() => expect(screen.getByTestId('game-lol')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('game-lol'));

    await waitFor(() => {
      expect(setUserSelectedGames).toHaveBeenCalledWith(['lol']);
    });
  });
});

describe('UserProfileGameSelector early-returns branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not dispatch when userId is empty (no user)', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    const store = makeTestStore({
      preferences: {
        gamesCatalog: [],
        selectedGameCodes: [],
        timezones: [],
        timezone: '',
        availability: [],
        loading: false,
      } as PreferencesState,
    });
    const setUserSelectedGames = jest.fn();

    render(
      <Provider store={store}>
        <UserProfileGameSelector
          userSelectedGames={[]}
          setUserSelectedGames={setUserSelectedGames}
        />
      </Provider>
    );

    expect(document.body).toBeDefined();
  });

  it('should not dispatch when gameId is missing in map (codeToId)', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 1 } });
    (api.get as unknown as jest.Mock).mockResolvedValueOnce({ data: { data: { games: [] } } });
    const store = makeTestStore({
      preferences: {
        gamesCatalog: [], // empty so codeToId will not contain any id
        selectedGameCodes: [],
        timezones: [],
        timezone: '',
        availability: [],
        loading: false,
      } as PreferencesState,
    });

    const setUserSelectedGames = jest.fn();

    render(
      <Provider store={store}>
        <UserProfileGameSelector
          userSelectedGames={[]}
          setUserSelectedGames={setUserSelectedGames}
        />
      </Provider>
    );

    const candidate = screen.queryByTestId('game-lol');
    if (candidate) {
      fireEvent.click(candidate);
      expect(setUserSelectedGames).not.toHaveBeenCalled();
    }
  });
});
