import type { AxiosError } from 'axios';

import {
  AddUserGamePayload,
  GameProfileRepository,
  RemoveUserGamePayload,
} from '@domain/repositories/profile/GameProfileRepository';
import { ApiPromise, ApiSuccessResponse, ApiErrorResponse } from '@domain/types/apiSchema';
import { GameToggleData } from '@domain/types/gameToggleResponse';
import { getUserGamesUrl } from '@shared/constants/apiRoutes';
import api from '@shared/services/axiosService';

export class GameProfileApiRepository implements GameProfileRepository {
  // No GET user games; use GET /profiles/:id via UserProfileApiRepository

  async addUserGame(payload: AddUserGamePayload): ApiPromise<GameToggleData> {
    try {
      const response = await api.put(getUserGamesUrl(String(payload.userId)), {
        gameId: payload.gameId,
      });
      return response.data as ApiSuccessResponse<GameToggleData>;
    } catch (error) {
      const e = error as AxiosError;
      const fallback: ApiErrorResponse<GameToggleData> = {
        success: false,
        data: null,
        status: 0,
        code: 'ERR_NETWORK',
        message: e.message,
        timestamp: new Date().toISOString(),
        requestId: 'req-add-game',
      };
      return (e.response?.data as ApiErrorResponse<GameToggleData>) ?? fallback;
    }
  }

  async removeUserGame(payload: RemoveUserGamePayload): ApiPromise<GameToggleData> {
    try {
      const response = await api.delete(getUserGamesUrl(String(payload.userId)), {
        data: { gameId: payload.gameId },
      });
      return response.data as ApiSuccessResponse<GameToggleData>;
    } catch (error) {
      const e = error as AxiosError;
      const fallback: ApiErrorResponse<GameToggleData> = {
        success: false,
        data: null,
        status: 0,
        code: 'ERR_NETWORK',
        message: e.message,
        timestamp: new Date().toISOString(),
        requestId: 'req-remove-game',
      };
      return (e.response?.data as ApiErrorResponse<GameToggleData>) ?? fallback;
    }
  }
}
