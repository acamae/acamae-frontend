import type { UnknownAction } from '@reduxjs/toolkit';

import {
  fetchGamesCatalogAction,
  fetchTimezonesCatalogAction,
} from '@application/state/actions/catalogs.actions';
import {
  addUserGameAction,
  removeUserGameAction,
  addUserAvailabilityAction,
  getUserProfileAction,
  putUserCountryAction,
  putUserTimezoneProfileAction,
} from '@application/state/actions/profile.actions';
import reducer, { initialProfileState } from '@application/state/slices/profileSlice';

describe('profileSlice reducer', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, { type: 'unknown' } as UnknownAction)).toEqual(initialProfileState);
  });

  it('should handle putUserCountryAction pending/fulfilled/rejected', () => {
    // pending
    let state = reducer(initialProfileState, { type: putUserCountryAction.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeUndefined();

    // fulfilled
    state = reducer(state, {
      type: putUserCountryAction.fulfilled.type,
      payload: { data: { country: { code: 'ES' } } },
    } as unknown as UnknownAction);
    expect(state.loading).toBe(false);
    expect(state.country).toBe('ES');

    // rejected
    state = reducer(state, { type: putUserCountryAction.rejected.type, error: { message: 'x' } });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('x');
  });

  it('should handle putUserTimezoneProfileAction pending/fulfilled/rejected', () => {
    // pending
    let state = reducer(initialProfileState, {
      type: putUserTimezoneProfileAction.pending.type,
    });
    expect(state.loading).toBe(true);
    expect(state.error).toBeUndefined();

    // fulfilled
    state = reducer(state, {
      type: putUserTimezoneProfileAction.fulfilled.type,
      payload: { data: { timezone: 'Europe/Madrid' } },
    } as unknown as UnknownAction);
    expect(state.loading).toBe(false);
    expect(state.timezone).toBe('Europe/Madrid');

    // rejected
    state = reducer(state, {
      type: putUserTimezoneProfileAction.rejected.type,
      error: { message: 'boom' },
    });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('boom');
  });

  it('should handle pending states', () => {
    const state1 = reducer(initialProfileState, { type: fetchGamesCatalogAction.pending.type });
    expect(state1.loading).toBe(true);
    const state2 = reducer(initialProfileState, { type: fetchTimezonesCatalogAction.pending.type });
    expect(state2.loading).toBe(true);
  });

  it('should handle fulfilled games catalog', () => {
    const payload = { success: true, data: { games: [{ id: 1, code: 'lol' }] } } as unknown;
    const state = reducer(initialProfileState, {
      type: fetchGamesCatalogAction.fulfilled.type,
      payload,
    });
    // Catalog load no longer overrides selected games
    expect(state.games.length).toBe(0);
  });

  it('should toggle selectedGameCodes on add/remove fulfilled and set profileIsActive', () => {
    const catalogState = reducer(initialProfileState, {
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
    expect(st1.games).toEqual([1]);
    expect(st1.profileIsActive).toBe(true);
    const remPayload = {
      success: true,
      data: { gameId: 1, selected: false, profileIsActive: false },
    } as unknown;
    const st2 = reducer(st1, {
      type: removeUserGameAction.fulfilled.type,
      payload: remPayload,
    } as unknown as UnknownAction);
    expect(st2.games).toEqual([]);
    expect(st2.profileIsActive).toBe(false);
  });

  it('should set public profile on getUserProfileAction fulfilled', () => {
    const payload = {
      success: true,
      data: { timezone: 'UTC', availability: [], games: [] },
    } as unknown;
    const state = reducer(initialProfileState, {
      type: getUserProfileAction.fulfilled.type,
      payload,
    });
    expect(state.timezone).toBe('UTC');
  });

  // Tests de ramas del reducer de preferences unificados
  describe('reducer branch behavior for preferencesSlice', () => {
    it('handles pending actions toggling loading to true', () => {
      let state = reducer(initialProfileState, { type: fetchGamesCatalogAction.pending.type });
      expect(state.loading).toBe(true);
      state = reducer(initialProfileState, { type: fetchTimezonesCatalogAction.pending.type });
      expect(state.loading).toBe(true);
      state = reducer(initialProfileState, { type: addUserAvailabilityAction.pending.type });
      expect(state.loading).toBe(true);
    });

    it('handles fulfilled and rejected branches with fallback values', () => {
      // fulfilled games: payload with null data
      let state = reducer(initialProfileState, {
        type: fetchGamesCatalogAction.fulfilled.type,
        payload: { data: null },
      });
      expect(state.loading).toBe(false);
      expect(state.games).toEqual([]);

      // rejected games: use default message
      state = reducer(initialProfileState, {
        type: fetchGamesCatalogAction.rejected.type,
        error: {},
      });
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to load games');

      // user games from public profile
      state = reducer(initialProfileState, {
        type: getUserProfileAction.fulfilled.type,
        payload: { data: { games: [{ id: 1, code: 'lol' }] } },
      });
      expect(Array.isArray(state.games)).toBe(true);

      // legacy branch preserved for backward-compat payloads: ignore if not present
      state = reducer(initialProfileState, {
        type: addUserGameAction.fulfilled.type,
        payload: { data: { games: [{ code: 'valorant' }] } },
      });
      // With new contract, add/remove uses toggle payload; when receiving legacy, reducer keeps state
      expect(state.games).toEqual([]);

      // putAvailability fulfilled with partial fields
      state = reducer(
        {
          ...initialProfileState,
          timezone: 'UTC',
          availability: [{ dayOfWeek: 1, start: '08:00', end: '09:00' }],
        },
        {
          type: addUserAvailabilityAction.fulfilled.type,
          payload: { data: { timezone: undefined, availability: undefined } },
        }
      );
      expect(state.loading).toBe(false);
      expect(state.timezone).toBe('UTC');
      expect(state.availability).toEqual([{ dayOfWeek: 1, start: '08:00', end: '09:00' }]);

      // putAvailability rejected
      state = reducer(
        { ...initialProfileState, loading: true },
        {
          type: addUserAvailabilityAction.rejected.type,
        }
      );
      expect(state.loading).toBe(false);

      // fetchTimezones fulfilled with empty data
      state = reducer(
        { ...initialProfileState, loading: true },
        {
          type: fetchTimezonesCatalogAction.fulfilled.type,
          payload: { data: null },
        }
      );
      expect(state.loading).toBe(false);
      expect(state.timezone).toEqual(null);
    });
  });
});
