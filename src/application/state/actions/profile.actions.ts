import { createAsyncThunk } from '@reduxjs/toolkit';

import { AddUserAvailabilityUseCase } from '@application/use-cases/profile/AvailabilityUseCases';
import { PutUserCountryUseCase } from '@application/use-cases/profile/UserCountryUseCase';
import {
  AddUserGameUseCase,
  RemoveUserGameUseCase,
} from '@application/use-cases/profile/UserGamesUseCases';
import { GetUserProfileUseCase } from '@application/use-cases/profile/UserProfileUseCases';
import { PutUserTimezoneUseCase } from '@application/use-cases/profile/UserTimezoneUseCases';
import {
  AddUserGamePayload,
  RemoveUserGamePayload,
} from '@domain/repositories/profile/GameProfileRepository';
import { PutUserCountryPayload } from '@domain/repositories/profile/UserCountryRepository';
import { GetUserProfilePayload } from '@domain/repositories/profile/UserProfileRepository';
import { PutUserTimezonePayload } from '@domain/repositories/profile/UserTimezoneRepository';

// Deprecated GETs removed: availability, country, timezone, games

export const addUserAvailabilityAction = createAsyncThunk(
  'profile/addAvailability',
  async (
    payload: {
      userId: string | number;
      timezone?: string;
      windows: { dayOfWeek: number; start: string; end: string }[];
    },
    { extra }
  ) => {
    const { addUserAvailabilityUseCase, putUserAvailabilityUseCase } = extra as {
      addUserAvailabilityUseCase?: AddUserAvailabilityUseCase;
      putUserAvailabilityUseCase?: AddUserAvailabilityUseCase;
    };
    const useCase = addUserAvailabilityUseCase ?? putUserAvailabilityUseCase;
    return await (useCase as AddUserAvailabilityUseCase).execute(payload);
  }
);

export const getUserProfileAction = createAsyncThunk(
  'profile/fetchUserProfile',
  async (payload: GetUserProfilePayload, { extra }) => {
    const { getUserProfileUseCase } = extra as {
      getUserProfileUseCase: GetUserProfileUseCase;
    };
    return await getUserProfileUseCase.execute(payload);
  }
);

// fetchUserGamesAction removed (use GET /profiles/:id via getUserProfileAction)

export const addUserGameAction = createAsyncThunk(
  'profile/addUserGame',
  async (payload: AddUserGamePayload, { extra }) => {
    const { addUserGameUseCase } = extra as { addUserGameUseCase: AddUserGameUseCase };
    return await addUserGameUseCase.execute(payload);
  }
);

export const removeUserGameAction = createAsyncThunk(
  'profile/removeUserGame',
  async (payload: RemoveUserGamePayload, { extra }) => {
    const { removeUserGameUseCase } = extra as { removeUserGameUseCase: RemoveUserGameUseCase };
    return await removeUserGameUseCase.execute(payload);
  }
);

export const putUserCountryAction = createAsyncThunk(
  'profile/putCountry',
  async (payload: PutUserCountryPayload, { extra, rejectWithValue }) => {
    const { putUserCountryUseCase } = extra as { putUserCountryUseCase: PutUserCountryUseCase };
    try {
      const result = await putUserCountryUseCase.execute(payload);
      if (!result.success) {
        return rejectWithValue(result);
      }
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// getUserCountryProfileAction removed (use getUserProfileAction)

// getUserTimezoneProfileAction removed (use getUserProfileAction)

export const putUserTimezoneProfileAction = createAsyncThunk(
  'profile/putUserTimezone',
  async (payload: PutUserTimezonePayload, { extra, rejectWithValue }) => {
    const { putUserTimezoneUseCase } = extra as { putUserTimezoneUseCase: PutUserTimezoneUseCase };
    try {
      const result = await putUserTimezoneUseCase.execute(payload);
      if (!result.success) {
        return rejectWithValue(result);
      }
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
