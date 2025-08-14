import { Action, configureStore } from '@reduxjs/toolkit';

import {
  addUserGameAction,
  removeUserGameAction,
  fetchGamesCatalogAction,
  fetchTimezonesAction,
  fetchAvailabilityAction,
  putAvailabilityAction,
} from '@application/state/actions/preferences.actions';
import reducer from '@application/state/slices/preferencesSlice';

describe('preferences.actions', () => {
  const makeStore = (extra: unknown) =>
    configureStore({
      reducer: { preferences: reducer },
      middleware: gDM => gDM({ serializableCheck: false, thunk: { extraArgument: extra } }),
    });

  it('fetchGamesCatalogAction should pass through use case', async () => {
    const listGamesUseCase = {
      execute: jest.fn().mockResolvedValue({ success: true, data: { games: [] } }),
    };
    const store = makeStore({ listGamesUseCase });
    const action = await store.dispatch(fetchGamesCatalogAction());
    expect(fetchGamesCatalogAction.fulfilled.match(action)).toBe(true);
    if (fetchGamesCatalogAction.fulfilled.match(action)) {
      expect(action.payload.success).toBe(true);
    }
  });

  it('fetchTimezonesAction should pass through use case', async () => {
    const getTimezonesCatalogUseCase = {
      execute: jest.fn().mockResolvedValue({ success: true, data: { timezones: [] } }),
    };
    const store = makeStore({ getTimezonesCatalogUseCase });
    const action = await store.dispatch(fetchTimezonesAction());
    expect(fetchTimezonesAction.fulfilled.match(action)).toBe(true);
    if (fetchTimezonesAction.fulfilled.match(action)) {
      expect(action.payload.success).toBe(true);
    }
  });

  it('fetchAvailabilityAction and putAvailabilityAction should pass through use cases', async () => {
    const getUserAvailabilityUseCase = {
      execute: jest
        .fn()
        .mockResolvedValue({ success: true, data: { timezone: '', availability: [] } }),
    };
    const putUserAvailabilityUseCase = {
      execute: jest
        .fn()
        .mockResolvedValue({ success: true, data: { timezone: 'UTC', availability: [] } }),
    };
    const store = makeStore({ getUserAvailabilityUseCase, putUserAvailabilityUseCase });
    const action1 = await store.dispatch(fetchAvailabilityAction(1));
    expect(fetchAvailabilityAction.fulfilled.match(action1)).toBe(true);
    if (fetchAvailabilityAction.fulfilled.match(action1)) {
      expect(action1.payload.success).toBe(true);
    }
    const action2 = await store.dispatch(
      putAvailabilityAction({ userId: 1, windows: [], timezone: 'UTC' })
    );
    expect(putAvailabilityAction.fulfilled.match(action2)).toBe(true);
    if (putAvailabilityAction.fulfilled.match(action2)) {
      expect(action2.payload.success).toBe(true);
    }
  });

  it('add/remove user game actions should pass through use cases and return toggle payload', async () => {
    const addUserGameUseCase = {
      execute: jest.fn().mockResolvedValue({
        success: true,
        data: { gameId: 1, selected: true, profileIsActive: true },
      }),
    };
    const removeUserGameUseCase = {
      execute: jest.fn().mockResolvedValue({
        success: true,
        data: { gameId: 1, selected: false, profileIsActive: false },
      }),
    };
    const store = makeStore({ addUserGameUseCase, removeUserGameUseCase });
    const action1 = await store.dispatch(
      addUserGameAction({ userId: 1, gameId: 1 }) as unknown as Action
    );
    expect(addUserGameAction.fulfilled.match(action1)).toBe(true);
    if (addUserGameAction.fulfilled.match(action1)) {
      expect(action1.payload.data).toBeTruthy();
      if (action1.payload.data) {
        expect(action1.payload.data.selected).toBe(true);
      }
    }
    const action2 = await store.dispatch(
      removeUserGameAction({ userId: 1, gameId: 1 }) as unknown as Action
    );
    expect(removeUserGameAction.fulfilled.match(action2)).toBe(true);
    if (removeUserGameAction.fulfilled.match(action2)) {
      expect(action2.payload.data).toBeTruthy();
      if (action2.payload.data) {
        expect(action2.payload.data.selected).toBe(false);
      }
    }
  });
});
