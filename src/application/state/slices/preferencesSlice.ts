import { createSlice } from '@reduxjs/toolkit';

import {
  addUserGameAction,
  fetchAvailabilityAction,
  fetchGamesCatalogAction,
  fetchTimezonesAction,
  fetchUserGamesAction,
  putAvailabilityAction,
  removeUserGameAction,
} from '@application/state/actions/preferences.actions';
import { AvailabilityWindow } from '@domain/entities/AvailabilityWindow';
import { Game } from '@domain/entities/Game';
import { Timezone } from '@domain/entities/Timezone';
import type { ApiErrorResponse, ApiSuccessResponse } from '@domain/types/apiSchema';

import type { GameToggleData } from '../../../domain/types/GameToggleResponse';

export interface PreferencesState {
  gamesCatalog: Game[];
  selectedGameCodes: string[];
  timezones: Timezone[];
  timezone?: string;
  availability: AvailabilityWindow[];
  loading: boolean;
  error?: string;
  profileIsActive?: boolean;
}

const initialState: PreferencesState = {
  gamesCatalog: [],
  selectedGameCodes: [],
  timezones: [],
  timezone: undefined,
  availability: [],
  loading: false,
  error: undefined,
  profileIsActive: undefined,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchGamesCatalogAction.pending, state => {
        state.loading = true;
      })
      .addCase(fetchTimezonesAction.pending, state => {
        state.loading = true;
      })
      .addCase(fetchGamesCatalogAction.fulfilled, (state, action) => {
        state.loading = false;
        state.gamesCatalog = action.payload.data?.games ?? [];
      })
      .addCase(fetchGamesCatalogAction.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.error.message || 'Failed to load games');
      })
      .addCase(fetchUserGamesAction.fulfilled, (state, action) => {
        state.selectedGameCodes = (action.payload.data?.games ?? []).map(g => g.code);
      })
      .addCase(addUserGameAction.fulfilled, (state, action) => {
        const payload = action.payload as
          | ApiSuccessResponse<GameToggleData>
          | ApiErrorResponse<GameToggleData>;
        const catalogCodes = new Map(state.gamesCatalog.map(g => [g.id, g.code] as const));
        const toggledCode = catalogCodes.get(
          (payload.data as GameToggleData | undefined)?.gameId ?? -1
        );
        if (toggledCode) {
          const set = new Set(state.selectedGameCodes);
          if ((payload.data as GameToggleData | undefined)?.selected) set.add(toggledCode);
          else set.delete(toggledCode);
          state.selectedGameCodes = Array.from(set.values());
        }
        state.profileIsActive =
          (payload.data as GameToggleData | undefined)?.profileIsActive ?? state.profileIsActive;
      })
      .addCase(removeUserGameAction.fulfilled, (state, action) => {
        const payload = action.payload as
          | ApiSuccessResponse<GameToggleData>
          | ApiErrorResponse<GameToggleData>;
        const catalogCodes = new Map(state.gamesCatalog.map(g => [g.id, g.code] as const));
        const toggledCode = catalogCodes.get(
          (payload.data as GameToggleData | undefined)?.gameId ?? -1
        );
        if (toggledCode) {
          const set = new Set(state.selectedGameCodes);
          if ((payload.data as GameToggleData | undefined)?.selected) set.add(toggledCode);
          else set.delete(toggledCode);
          state.selectedGameCodes = Array.from(set.values());
        }
        state.profileIsActive =
          (payload.data as GameToggleData | undefined)?.profileIsActive ?? state.profileIsActive;
      })
      .addCase(fetchAvailabilityAction.fulfilled, (state, action) => {
        state.timezone = action.payload.data?.timezone ?? undefined;
        state.availability = action.payload.data?.availability ?? [];
      })
      .addCase(putAvailabilityAction.pending, state => {
        state.loading = true;
      })
      .addCase(putAvailabilityAction.fulfilled, (state, action) => {
        state.loading = false;
        state.timezone = action.payload.data?.timezone ?? state.timezone;
        state.availability = action.payload.data?.availability ?? state.availability;
      })
      .addCase(putAvailabilityAction.rejected, state => {
        state.loading = false;
      })
      .addCase(fetchTimezonesAction.fulfilled, (state, action) => {
        state.timezones = action.payload.data?.timezones ?? [];
        state.loading = false;
      });
  },
});

export const initialPreferencesState = initialState;
export default preferencesSlice.reducer;
