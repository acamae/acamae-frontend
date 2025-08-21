import { createSlice } from '@reduxjs/toolkit';

import {
  fetchCountriesCatalogAction,
  fetchGamesCatalogAction,
  fetchTimezonesCatalogAction,
} from '@application/state/actions/catalogs.actions';
import { CatalogsState } from '@domain/types/catalogsState';

const initialState: CatalogsState = {
  games: [],
  countries: [],
  timezones: [],
  loading: false,
  error: undefined,
};

const catalogsSlice = createSlice({
  name: 'catalogs',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder

      // Games
      .addCase(fetchGamesCatalogAction.pending, state => {
        state.loading = true;
      })
      .addCase(fetchGamesCatalogAction.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload.data?.games ?? [];
      })
      .addCase(fetchGamesCatalogAction.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.error.message || 'Failed to load games');
      })

      // Timezones
      .addCase(fetchTimezonesCatalogAction.pending, state => {
        state.loading = true;
      })
      .addCase(fetchTimezonesCatalogAction.fulfilled, (state, action) => {
        state.timezones = action.payload.data?.timezones ?? [];
        state.loading = false;
      })
      .addCase(fetchTimezonesCatalogAction.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.error.message || 'Failed to load timezones');
      })

      // Countries
      .addCase(fetchCountriesCatalogAction.pending, state => {
        state.loading = true;
      })
      .addCase(fetchCountriesCatalogAction.fulfilled, (state, action) => {
        state.countries = action.payload.data?.countries ?? [];
        state.loading = false;
      })
      .addCase(fetchCountriesCatalogAction.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.error.message || 'Failed to load countries');
      });
  },
});

export const initialCatalogsState = initialState;
export default catalogsSlice.reducer;
