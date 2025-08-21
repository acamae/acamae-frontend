import { Game } from '@domain/entities/Game';
import { User } from '@domain/entities/User';

import { AvailabilityResponse } from './availabilityResponse';

export type Profile = {
  user: User;
  games: Game[];
  timezone: string | null;
  availability: AvailabilityResponse;
};
