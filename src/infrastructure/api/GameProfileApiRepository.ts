import type { AxiosError } from 'axios';

import { Game } from '@domain/entities/Game';
import { GameProfileRepository } from '@domain/repositories/GameProfileRepository';
import { GameToggleData } from '@domain/types/GameToggleResponse';
import { ApiPromise, ApiSuccessResponse, ApiErrorResponse } from '@domain/types/apiSchema';
import { getUserGamesUrl } from '@shared/constants/apiRoutes';
import api from '@shared/services/axiosService';

export class GameProfileApiRepository implements GameProfileRepository {
  async getUserGames(userId: string | number): ApiPromise<{ games: Game[] }> {
    try {
      const response = await api.get(getUserGamesUrl(String(userId)));
      return response.data as ApiSuccessResponse<{ games: Game[] }>;
    } catch (error) {
      const e = error as AxiosError;
      return (
        (e.response?.data as ApiErrorResponse<{ games: Game[] }>) ?? {
          success: false,
          data: null,
          status: 0,
          code: 'ERR_NETWORK',
          message: e.message,
          timestamp: new Date().toISOString(),
          requestId: 'req-user-games',
        }
      );
    }
  }

  async addUserGame(userId: string | number, gameId: number): ApiPromise<GameToggleData> {
    try {
      const response = await api.put(getUserGamesUrl(String(userId)), { userId, gameId });
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

  async removeUserGame(userId: string | number, gameId: number): ApiPromise<GameToggleData> {
    try {
      const response = await api.delete(getUserGamesUrl(String(userId)), {
        data: { userId, gameId },
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
