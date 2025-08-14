import type { UnknownAction } from '@reduxjs/toolkit';

import {
  fetchGamesCatalogAction,
  fetchTimezonesAction,
  fetchAvailabilityAction,
  addUserGameAction,
  removeUserGameAction,
  fetchUserGamesAction,
  putAvailabilityAction,
} from '@application/state/actions/preferences.actions';
import reducer, { initialPreferencesState } from '@application/state/slices/preferencesSlice';

describe('preferencesSlice reducer', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, { type: 'unknown' } as UnknownAction)).toEqual(
      initialPreferencesState
    );
  });

  it('should handle pending states', () => {
    const state1 = reducer(initialPreferencesState, { type: fetchGamesCatalogAction.pending.type });
    expect(state1.loading).toBe(true);
    const state2 = reducer(initialPreferencesState, { type: fetchTimezonesAction.pending.type });
    expect(state2.loading).toBe(true);
  });

  it('should handle fulfilled games catalog', () => {
    const payload = { success: true, data: { games: [{ id: 1, code: 'lol' }] } } as unknown;
    const state = reducer(initialPreferencesState, {
      type: fetchGamesCatalogAction.fulfilled.type,
      payload,
    });
    expect(state.gamesCatalog.length).toBe(1);
  });

  it('should toggle selectedGameCodes on add/remove fulfilled and set profileIsActive', () => {
    const catalogState = reducer(initialPreferencesState, {
      type: fetchGamesCatalogAction.fulfilled.type,
      payload: { success: true, data: { games: [{ id: 1, code: 'lol' }] } },
    } as unknown as UnknownAction);
    const addPayload = {
      success: true,
      data: { gameId: 1, selected: true, profileIsActive: true },
    } as unknown;
    const st1 = reducer(catalogState, {
      type: addUserGameAction.fulfilled.type,
      payload: addPayload,
    });
    expect(st1.selectedGameCodes).toEqual(['lol']);
    expect(st1.profileIsActive).toBe(true);
    const remPayload = {
      success: true,
      data: { gameId: 1, selected: false, profileIsActive: false },
    } as unknown;
    const st2 = reducer(st1, {
      type: removeUserGameAction.fulfilled.type,
      payload: remPayload,
    } as unknown as UnknownAction);
    expect(st2.selectedGameCodes).toEqual([]);
    expect(st2.profileIsActive).toBe(false);
  });

  it('should set timezone on availability fulfilled', () => {
    const payload = { success: true, data: { timezone: 'UTC', availability: [] } } as unknown;
    const state = reducer(initialPreferencesState, {
      type: fetchAvailabilityAction.fulfilled.type,
      payload,
    });
    expect(state.timezone).toBe('UTC');
  });

  // Tests de ramas del reducer de preferences unificados
  describe('reducer branch behavior for preferencesSlice', () => {
    it('handles pending actions toggling loading to true', () => {
      let state = reducer(initialPreferencesState, { type: fetchGamesCatalogAction.pending.type });
      expect(state.loading).toBe(true);
      state = reducer(initialPreferencesState, { type: fetchTimezonesAction.pending.type });
      expect(state.loading).toBe(true);
      state = reducer(initialPreferencesState, { type: putAvailabilityAction.pending.type });
      expect(state.loading).toBe(true);
    });

    it('handles fulfilled and rejected branches with fallback values', () => {
      // fulfilled games: payload with null data
      let state = reducer(initialPreferencesState, {
        type: fetchGamesCatalogAction.fulfilled.type,
        payload: { data: null },
      });
      expect(state.loading).toBe(false);
      expect(state.gamesCatalog).toEqual([]);

      // rejected games: use default message
      state = reducer(initialPreferencesState, {
        type: fetchGamesCatalogAction.rejected.type,
        error: {},
      });
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to load games');

      // user games
      state = reducer(initialPreferencesState, {
        type: fetchUserGamesAction.fulfilled.type,
        payload: { data: { games: [{ code: 'lol' }] } },
      });
      expect(state.selectedGameCodes).toEqual(['lol']);

      // legacy branch preserved for backward-compat payloads: ignore if not present
      state = reducer(initialPreferencesState, {
        type: addUserGameAction.fulfilled.type,
        payload: { data: { games: [{ code: 'valorant' }] } },
      });
      // With new contract, add/remove uses toggle payload; when receiving legacy, reducer keeps state
      expect(state.selectedGameCodes).toEqual([]);

      state = reducer(initialPreferencesState, {
        type: fetchAvailabilityAction.fulfilled.type,
        payload: { data: null },
      });
      expect(state.timezone).toBeUndefined();
      expect(state.availability).toEqual([]);

      // putAvailability fulfilled with partial fields
      state = reducer(
        {
          ...initialPreferencesState,
          timezone: 'UTC',
          availability: [{ dayOfWeek: 1, start: '08:00', end: '09:00' }],
        },
        {
          type: putAvailabilityAction.fulfilled.type,
          payload: { data: { timezone: undefined, availability: undefined } },
        }
      );
      expect(state.loading).toBe(false);
      expect(state.timezone).toBe('UTC');
      expect(state.availability).toEqual([{ dayOfWeek: 1, start: '08:00', end: '09:00' }]);

      // putAvailability rejected
      state = reducer(
        { ...initialPreferencesState, loading: true },
        {
          type: putAvailabilityAction.rejected.type,
        }
      );
      expect(state.loading).toBe(false);

      // fetchTimezones fulfilled with empty data
      state = reducer(
        { ...initialPreferencesState, loading: true },
        {
          type: fetchTimezonesAction.fulfilled.type,
          payload: { data: null },
        }
      );
      expect(state.loading).toBe(false);
      expect(state.timezones).toEqual([]);
    });
  });
});
