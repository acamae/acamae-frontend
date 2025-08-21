import { Country } from '@domain/entities/Country';
import { Game } from '@domain/entities/Game';
import { Timezone } from '@domain/entities/Timezone';

export interface CatalogsState {
  games: Game[];
  countries: Country[];
  timezones: Timezone[];
  loading: boolean;
  error?: string;
}
