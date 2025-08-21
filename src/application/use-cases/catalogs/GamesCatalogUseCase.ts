import { Game } from '@domain/entities/Game';
import { GameRepository } from '@domain/repositories/catalogs/GameRepository';
import { ApiPromise } from '@domain/types/apiSchema';

export class GetGamesCatalogUseCase {
  constructor(private readonly gamesRepository: GameRepository) {}

  async execute(): ApiPromise<{ games: Game[] }> {
    return this.gamesRepository.getGamesCatalog();
  }
}
