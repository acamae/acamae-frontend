import { Action, configureStore } from '@reduxjs/toolkit';

import {
  fetchGamesCatalogAction,
  fetchTimezonesCatalogAction,
  fetchCountriesCatalogAction,
} from '@application/state/actions/catalogs.actions';
import {
  addUserGameAction,
  removeUserGameAction,
  addUserAvailabilityAction,
} from '@application/state/actions/profile.actions';
import reducer from '@application/state/slices/profileSlice';

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

  it('fetchTimezonesCatalogAction should pass through use case', async () => {
    const getTimezonesCatalogUseCase = {
      execute: jest.fn().mockResolvedValue({ success: true, data: { timezones: [] } }),
    };
    const store = makeStore({ getTimezonesCatalogUseCase });
    const action = await store.dispatch(fetchTimezonesCatalogAction());
    expect(fetchTimezonesCatalogAction.fulfilled.match(action)).toBe(true);
    if (fetchTimezonesCatalogAction.fulfilled.match(action)) {
      expect(action.payload.success).toBe(true);
    }
  });

  it('fetchCountriesCatalogAction should pass through use case', async () => {
    const getCountriesCatalogUseCase = {
      execute: jest.fn().mockResolvedValue({ success: true, data: { countries: [] } }),
    };
    const store = makeStore({ getCountriesCatalogUseCase });
    const action = await store.dispatch(fetchCountriesCatalogAction());
    expect(fetchCountriesCatalogAction.fulfilled.match(action)).toBe(true);
    if (fetchCountriesCatalogAction.fulfilled.match(action)) {
      expect(action.payload.success).toBe(true);
    }
  });

  it('fetchCountriesCatalogAction should fallback to getCountriesUseCase when primary is missing', async () => {
    const getCountriesUseCase = {
      execute: jest.fn().mockResolvedValue({ success: true, data: { countries: [] } }),
    };
    const store = makeStore({ getCountriesUseCase });
    const action = await store.dispatch(fetchCountriesCatalogAction());
    expect(fetchCountriesCatalogAction.fulfilled.match(action)).toBe(true);
    if (fetchCountriesCatalogAction.fulfilled.match(action)) {
      expect(action.payload.success).toBe(true);
    }
    expect(getCountriesUseCase.execute).toHaveBeenCalled();
  });

  it('addUserAvailabilityAction should pass through use case', async () => {
    const putUserAvailabilityUseCase = {
      execute: jest
        .fn()
        .mockResolvedValue({ success: true, data: { timezone: 'UTC', availability: [] } }),
    };
    const store = makeStore({ putUserAvailabilityUseCase });
    const action2 = await store.dispatch(
      addUserAvailabilityAction({ userId: 1, windows: [], timezone: 'UTC' }) as unknown as Action
    );
    expect(addUserAvailabilityAction.fulfilled.match(action2)).toBe(true);
    if (addUserAvailabilityAction.fulfilled.match(action2)) {
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
