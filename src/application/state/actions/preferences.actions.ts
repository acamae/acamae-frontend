import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  GetUserAvailabilityUseCase,
  PutUserAvailabilityUseCase,
} from '@application/use-cases/preferences/AvailabilityUseCases';
import { GetUserPublicProfileUseCase } from '@application/use-cases/preferences/GetUserPublicProfileUseCase';
import { ListGamesUseCase } from '@application/use-cases/preferences/ListGamesUseCase';
import { GetTimezonesCatalogUseCase } from '@application/use-cases/preferences/TimezonesUseCase';
import {
  AddUserGameUseCase,
  GetUserGamesUseCase,
  RemoveUserGameUseCase,
} from '@application/use-cases/preferences/UserGamesUseCases';
import type { ApiResponse } from '@domain/types/apiSchema';

import type { GameToggleData } from '../../../domain/types/GameToggleResponse';

export const fetchGamesCatalogAction = createAsyncThunk(
  'preferences/fetchGamesCatalog',
  async (_, { extra }) => {
    const { listGamesUseCase } = extra as { listGamesUseCase: ListGamesUseCase };
    return await listGamesUseCase.execute();
  }
);

export const fetchUserPublicProfileAction = createAsyncThunk(
  'preferences/fetchUserPublicProfile',
  async (userId: string, { extra }) => {
    const { getUserPublicProfileUseCase } = extra as {
      getUserPublicProfileUseCase: GetUserPublicProfileUseCase;
    };
    return await getUserPublicProfileUseCase.execute(userId);
  }
);

export const fetchUserGamesAction = createAsyncThunk(
  'preferences/fetchUserGames',
  async (userId: string | number, { extra }) => {
    const { getUserGamesUseCase } = extra as { getUserGamesUseCase: GetUserGamesUseCase };
    return await getUserGamesUseCase.execute(userId);
  }
);

export const addUserGameAction = createAsyncThunk<
  ApiResponse<GameToggleData>,
  { userId: string | number; gameId: number }
>('preferences/addUserGame', async (payload, { extra }) => {
  const { addUserGameUseCase } = extra as { addUserGameUseCase: AddUserGameUseCase };
  return await addUserGameUseCase.execute(payload.userId, payload.gameId);
});

export const removeUserGameAction = createAsyncThunk<
  ApiResponse<GameToggleData>,
  { userId: string | number; gameId: number }
>('preferences/removeUserGame', async (payload, { extra }) => {
  const { removeUserGameUseCase } = extra as { removeUserGameUseCase: RemoveUserGameUseCase };
  return await removeUserGameUseCase.execute(payload.userId, payload.gameId);
});

export const fetchAvailabilityAction = createAsyncThunk(
  'preferences/fetchAvailability',
  async (userId: string | number, { extra }) => {
    const { getUserAvailabilityUseCase } = extra as {
      getUserAvailabilityUseCase: GetUserAvailabilityUseCase;
    };
    return await getUserAvailabilityUseCase.execute(userId);
  }
);

export const putAvailabilityAction = createAsyncThunk(
  'preferences/putAvailability',
  async (
    payload: {
      userId: string | number;
      timezone?: string;
      windows: { dayOfWeek: number; start: string; end: string }[];
    },
    { extra }
  ) => {
    const { putUserAvailabilityUseCase } = extra as {
      putUserAvailabilityUseCase: PutUserAvailabilityUseCase;
    };
    return await putUserAvailabilityUseCase.execute(payload);
  }
);

export const fetchTimezonesAction = createAsyncThunk(
  'preferences/fetchTimezones',
  async (_, { extra }) => {
    const { getTimezonesCatalogUseCase } = extra as {
      getTimezonesCatalogUseCase: GetTimezonesCatalogUseCase;
    };
    return await getTimezonesCatalogUseCase.execute();
  }
);
