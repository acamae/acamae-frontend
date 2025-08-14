import { Game } from '@domain/entities/Game';
import { GameProfileRepository } from '@domain/repositories/GameProfileRepository';
import { GameToggleData } from '@domain/types/GameToggleResponse';
import { ApiPromise } from '@domain/types/apiSchema';

export class GetUserGamesUseCase {
  constructor(private readonly repo: GameProfileRepository) {}
  async execute(userId: string | number): ApiPromise<{ games: Game[] }> {
    return this.repo.getUserGames(userId);
  }
}

export class AddUserGameUseCase {
  constructor(private readonly repo: GameProfileRepository) {}
  async execute(userId: string | number, gameId: number): ApiPromise<GameToggleData> {
    return this.repo.addUserGame(userId, gameId);
  }
}

export class RemoveUserGameUseCase {
  constructor(private readonly repo: GameProfileRepository) {}
  async execute(userId: string | number, gameId: number): ApiPromise<GameToggleData> {
    return this.repo.removeUserGame(userId, gameId);
  }
}
