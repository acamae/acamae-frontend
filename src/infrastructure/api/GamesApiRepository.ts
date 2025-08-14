import type { AxiosError } from 'axios';

import { Game } from '@domain/entities/Game';
import { GameRepository } from '@domain/repositories/GameRepository';
import { ApiPromise, ApiSuccessResponse, ApiErrorResponse } from '@domain/types/apiSchema';
import { API_ROUTES } from '@shared/constants/apiRoutes';
import api from '@shared/services/axiosService';

export class GamesApiRepository implements GameRepository {
  async findAll(): ApiPromise<{ games: Game[] }> {
    try {
      const response = await api.get(`${API_ROUTES.BASE}${API_ROUTES.GAMES.GET_ALL}`);
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
          requestId: 'req-games-findall',
        }
      );
    }
  }
}
