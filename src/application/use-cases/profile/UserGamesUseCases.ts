import {
  AddUserGamePayload,
  GameProfileRepository,
  RemoveUserGamePayload,
} from '@domain/repositories/profile/GameProfileRepository';
import { ApiPromise } from '@domain/types/apiSchema';
import { GameToggleData } from '@domain/types/gameToggleResponse';

export class AddUserGameUseCase {
  constructor(private readonly repo: GameProfileRepository) {}
  async execute(payload: AddUserGamePayload): ApiPromise<GameToggleData> {
    return this.repo.addUserGame(payload);
  }
}

export class RemoveUserGameUseCase {
  constructor(private readonly repo: GameProfileRepository) {}
  async execute(payload: RemoveUserGamePayload): ApiPromise<GameToggleData> {
    return this.repo.removeUserGame(payload);
  }
}
