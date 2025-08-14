import { Game } from '@domain/entities/Game';
import { GameRepository } from '@domain/repositories/GameRepository';
import { ApiPromise } from '@domain/types/apiSchema';

export class ListGamesUseCase {
  constructor(private readonly gamesRepository: GameRepository) {}

  async execute(): ApiPromise<{ games: Game[] }> {
    return this.gamesRepository.findAll();
  }
}
