import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  fetchGamesCatalogAction,
  fetchTimezonesCatalogAction,
} from '@application/state/actions/catalogs.actions';
import {
  addUserGameAction,
  removeUserGameAction,
  getUserProfileAction,
  addUserAvailabilityAction,
  putUserCountryAction,
  putUserTimezoneProfileAction,
} from '@application/state/actions/profile.actions';
import { PutUserCountryResponse } from '@domain/repositories/profile/UserCountryRepository';
import { PutUserTimezoneResponse } from '@domain/repositories/profile/UserTimezoneRepository';
import { ApiErrorResponse, ApiSuccessResponse } from '@domain/types/apiSchema';
import type { AvailabilityWindow } from '@domain/types/availabilityWindow';
import { GameToggleData } from '@domain/types/gameToggleResponse';
import { ProfileState } from '@domain/types/profileState';

const initialState: ProfileState = {
  profileId: null,
  country: null,
  timezone: null,
  availability: [],
  games: [],
  profileIsActive: undefined,
  loading: false,
  error: undefined,
  loadedAt: null,
};

export const initialProfileState = initialState;

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileId(state, action: PayloadAction<string | number | null>) {
      state.profileId = action.payload;
      console.log('setProfileId', action.payload);
    },
    setCountry(state, action: PayloadAction<string | null | undefined>) {
      state.country = action.payload ?? null;
    },
    setSelectedGameIds(state, action: PayloadAction<number[]>) {
      state.games = (action.payload ?? []).map(id => Number(id)).filter(n => Number.isFinite(n));
    },
    applyGameToggleToProfile(state, action: PayloadAction<{ gameId: number; selected: boolean }>) {
      const { gameId, selected } = action.payload;
      const id = Number(gameId);
      if (!Number.isFinite(id)) return;
      const set = new Set(state.games);
      if (selected) set.add(id);
      else set.delete(id);
      state.games = Array.from(set.values());
    },
  },
  extraReducers: builder => {
    builder
      // Profile (GET canonical)
      .addCase(getUserProfileAction.pending, state => {
        // If loaded recently, skip toggling loading to avoid UI flicker
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getUserProfileAction.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data as unknown as {
          games?: Array<{ id: number; code: string }>;
          timezone?: string | null;
          availability?: AvailabilityWindow[];
          country?: string | null;
        };
        if (data) {
          state.games = (data.games ?? []).map(g => Number(g.id)).filter(n => Number.isFinite(n));
          state.timezone = data.timezone ?? state.timezone ?? null;
          state.availability = data.availability ?? state.availability;
          if (typeof data.country === 'string' || data.country === null) {
            state.country = data.country;
          }
        }
        state.loadedAt = Date.now();
      })
      .addCase(getUserProfileAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message;
      })

      // Maintain legacy expectations from tests: treat catalogs pending/rejected in profile slice
      .addCase(fetchGamesCatalogAction.pending, state => {
        state.loading = true;
      })
      .addCase(fetchGamesCatalogAction.fulfilled, state => {
        // Do not modify selected games on catalog load
        state.loading = false;
      })
      .addCase(fetchGamesCatalogAction.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.error?.message || 'Failed to load games');
      })
      .addCase(fetchTimezonesCatalogAction.pending, state => {
        state.loading = true;
      })
      .addCase(fetchTimezonesCatalogAction.fulfilled, state => {
        state.loading = false;
      })

      // Availability (PUT replace)
      .addCase(addUserAvailabilityAction.pending, state => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(addUserAvailabilityAction.fulfilled, (state, action) => {
        const resp = action.payload.data as unknown as {
          timezone: string | null;
          availability: AvailabilityWindow[];
        };
        state.timezone = resp?.timezone ?? state.timezone ?? null;
        state.availability = resp?.availability ?? state.availability;
        state.loading = false;
      })
      .addCase(addUserAvailabilityAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message;
      })

      // Profile Games (PUT/DELETE toggles)
      .addCase(addUserGameAction.pending, state => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(addUserGameAction.fulfilled, (state, action) => {
        const payload = action.payload as
          | ApiSuccessResponse<GameToggleData>
          | ApiErrorResponse<GameToggleData>;
        const toggle = payload.data as GameToggleData | undefined;
        if (toggle && typeof toggle.gameId === 'number') {
          const id = Number(toggle.gameId);
          const set = new Set(state.games);
          if (toggle.selected) set.add(id);
          else set.delete(id);
          state.games = Array.from(set.values());
        }
        state.profileIsActive = toggle?.profileIsActive ?? state.profileIsActive;
      })
      .addCase(addUserGameAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message;
      })

      // Profile Games (DELETE)
      .addCase(removeUserGameAction.pending, state => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(removeUserGameAction.fulfilled, (state, action) => {
        const payload = action.payload as
          | ApiSuccessResponse<GameToggleData>
          | ApiErrorResponse<GameToggleData>;
        const toggle = payload.data as GameToggleData | undefined;
        if (toggle && typeof toggle.gameId === 'number') {
          const id = Number(toggle.gameId);
          const set = new Set(state.games);
          if (toggle.selected) set.add(id);
          else set.delete(id);
          state.games = Array.from(set.values());
        }
        state.profileIsActive = toggle?.profileIsActive ?? state.profileIsActive;
      })
      .addCase(removeUserGameAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message;
      })

      // Profile Country (PUT)
      .addCase(putUserCountryAction.pending, state => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(putUserCountryAction.fulfilled, (state, action) => {
        const payload = action.payload as unknown as ApiSuccessResponse<PutUserCountryResponse>;
        const countryField = payload?.data?.country as unknown;
        const code =
          (countryField &&
          typeof countryField === 'object' &&
          'code' in (countryField as Record<string, unknown>)
            ? (countryField as { code?: string }).code
            : typeof countryField === 'string'
              ? (countryField as string)
              : '') || '';
        state.country = code || null;
        if (typeof payload?.data?.profileIsActive === 'boolean') {
          state.profileIsActive = payload.data.profileIsActive;
        }
        state.loading = false;
      })
      .addCase(putUserCountryAction.rejected, (state, action) => {
        state.loading = false;
        const rejectedPayload = action.payload as
          | ApiErrorResponse<PutUserCountryResponse>
          | string
          | undefined;
        if (
          rejectedPayload &&
          typeof rejectedPayload === 'object' &&
          'message' in rejectedPayload
        ) {
          state.error = (rejectedPayload as { message?: string }).message;
        } else {
          state.error = action.error?.message;
        }
      })

      // Profile Timezone (PUT)
      .addCase(putUserTimezoneProfileAction.pending, state => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(putUserTimezoneProfileAction.fulfilled, (state, action) => {
        const payload = action.payload as unknown as ApiSuccessResponse<PutUserTimezoneResponse>;
        const tz = payload?.data?.timezone ?? null;
        state.timezone = tz;
        if (typeof payload?.data?.profileIsActive === 'boolean') {
          state.profileIsActive = payload.data.profileIsActive;
        }
        state.loading = false;
      })
      .addCase(putUserTimezoneProfileAction.rejected, (state, action) => {
        state.loading = false;
        const rejectedPayload = action.payload as
          | ApiErrorResponse<PutUserTimezoneResponse>
          | string
          | undefined;
        if (
          rejectedPayload &&
          typeof rejectedPayload === 'object' &&
          'message' in rejectedPayload
        ) {
          state.error = (rejectedPayload as { message?: string }).message;
        } else {
          state.error = action.error?.message;
        }
      });
  },
});

export const { setProfileId, setCountry, setSelectedGameIds, applyGameToggleToProfile } =
  profileSlice.actions;
export default profileSlice.reducer;
