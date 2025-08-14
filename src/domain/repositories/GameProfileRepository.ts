import { Game } from '@domain/entities/Game';
import { GameToggleData } from '@domain/types/GameToggleResponse';
import { ApiPromise } from '@domain/types/apiSchema';

export interface GameProfileRepository {
  getUserGames(userId: string | number): ApiPromise<{ games: Game[] }>;
  addUserGame(userId: string | number, gameId: number): ApiPromise<GameToggleData>;
  removeUserGame(userId: string | number, gameId: number): ApiPromise<GameToggleData>;
}
