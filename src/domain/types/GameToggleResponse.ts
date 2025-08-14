import { ApiResponse } from '@domain/types/apiSchema';

export interface GameToggleData {
  gameId: number;
  selected: boolean;
  profileIsActive: boolean;
}

export type GameToggleResponse = ApiResponse<GameToggleData>;
