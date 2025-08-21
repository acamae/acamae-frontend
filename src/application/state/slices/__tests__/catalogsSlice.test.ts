import type { UnknownAction } from '@reduxjs/toolkit';

import {
  fetchCountriesCatalogAction,
  fetchGamesCatalogAction,
  fetchTimezonesCatalogAction,
} from '@application/state/actions/catalogs.actions';
import reducer, { initialCatalogsState } from '@application/state/slices/catalogsSlice';

describe('catalogsSlice reducer', () => {
  it('should handle games pending/fulfilled/rejected', () => {
    const pending = reducer(initialCatalogsState, {
      type: fetchGamesCatalogAction.pending.type,
    } as UnknownAction);
    expect(pending.loading).toBe(true);

    const fulfilled = reducer(pending, {
      type: fetchGamesCatalogAction.fulfilled.type,
      payload: { data: { games: [{ id: 1, code: 'lol' }] } },
    } as UnknownAction);
    expect(fulfilled.loading).toBe(false);
    expect(fulfilled.games.length).toBe(1);

    const rejected = reducer(fulfilled, {
      type: fetchGamesCatalogAction.rejected.type,
      error: { message: 'boom' },
    } as unknown as UnknownAction);
    expect(rejected.loading).toBe(false);
    expect(rejected.error).toBe('boom');
  });

  it('should set empty arrays when fulfilled payloads have no data', () => {
    // games without data
    let state = reducer(initialCatalogsState, {
      type: fetchGamesCatalogAction.fulfilled.type,
      payload: { data: {} },
    } as UnknownAction);
    expect(state.games).toEqual([]);

    // timezones without data
    state = reducer(state, {
      type: fetchTimezonesCatalogAction.fulfilled.type,
      payload: { data: {} },
    } as UnknownAction);
    expect(state.timezones).toEqual([]);

    // countries without data
    state = reducer(state, {
      type: fetchCountriesCatalogAction.fulfilled.type,
      payload: { data: {} },
    } as UnknownAction);
    expect(state.countries).toEqual([]);
  });

  it('should handle timezones pending/fulfilled/rejected', () => {
    const pending = reducer(initialCatalogsState, {
      type: fetchTimezonesCatalogAction.pending.type,
    } as UnknownAction);
    expect(pending.loading).toBe(true);

    const fulfilled = reducer(pending, {
      type: fetchTimezonesCatalogAction.fulfilled.type,
      payload: { data: { timezones: [{ id: 'UTC' }] } },
    } as UnknownAction);
    expect(fulfilled.timezones.length).toBe(1);
    expect(fulfilled.loading).toBe(false);

    const rejected = reducer(fulfilled, {
      type: fetchTimezonesCatalogAction.rejected.type,
      error: { message: 'tz-error' },
    } as unknown as UnknownAction);
    expect(rejected.loading).toBe(false);
    expect(rejected.error).toBe('tz-error');
  });

  it('should handle countries pending/fulfilled/rejected', () => {
    const pending = reducer(initialCatalogsState, {
      type: fetchCountriesCatalogAction.pending.type,
    } as UnknownAction);
    expect(pending.loading).toBe(true);

    const fulfilled = reducer(pending, {
      type: fetchCountriesCatalogAction.fulfilled.type,
      payload: { data: { countries: [{ code: 'ES', nameCode: 'country.es' }] } },
    } as UnknownAction);
    expect(fulfilled.countries.length).toBe(1);
    expect(fulfilled.loading).toBe(false);

    const rejected = reducer(fulfilled, {
      type: fetchCountriesCatalogAction.rejected.type,
      error: { message: 'ctry-error' },
    } as unknown as UnknownAction);
    expect(rejected.loading).toBe(false);
    expect(rejected.error).toBe('ctry-error');
  });

  it('should set default error message when rejected without message', () => {
    // games rejected without message
    let state = reducer(initialCatalogsState, {
      type: fetchGamesCatalogAction.rejected.type,
      error: {},
    } as unknown as UnknownAction);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed to load games');

    // timezones rejected without message
    state = reducer(state, {
      type: fetchTimezonesCatalogAction.rejected.type,
      error: {},
    } as unknown as UnknownAction);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed to load timezones');

    // countries rejected without message
    state = reducer(state, {
      type: fetchCountriesCatalogAction.rejected.type,
      error: {},
    } as unknown as UnknownAction);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed to load countries');
  });
});
