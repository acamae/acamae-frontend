import { ApiPromise } from '@domain/types/apiSchema';
import { GameToggleData } from '@domain/types/gameToggleResponse';

export interface AddUserGamePayload {
  userId: string | number;
  gameId: number;
}

export interface RemoveUserGamePayload {
  userId: string | number;
  gameId: number;
}

export interface GameProfileRepository {
  addUserGame(payload: AddUserGamePayload): ApiPromise<GameToggleData>;
  removeUserGame(payload: RemoveUserGamePayload): ApiPromise<GameToggleData>;
}
