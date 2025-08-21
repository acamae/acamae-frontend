import { Entity } from '@domain/types/entity';

export interface Profile extends Entity {
  userId: number;
  countryCode: string;
  timezone: string;
  games: string[];
  availability: Availability;
  discordId: number;
  riotId: number;
  profileImageFilename: string;
  isActive: boolean;
}

export interface Availability {
  days: number[];
  times: string[];
}
