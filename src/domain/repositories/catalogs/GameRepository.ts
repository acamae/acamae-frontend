import { Game } from '@domain/entities/Game';
import { ApiPromise } from '@domain/types/apiSchema';

export interface GameRepository {
  getGamesCatalog(): ApiPromise<{ games: Game[] }>;
}
