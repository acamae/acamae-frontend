import { Timezone } from '@domain/entities/Timezone';
import { ApiPromise } from '@domain/types/apiSchema';

export interface TimezonesCatalog {
  version: string;
  lastUpdated: string;
  source: 'tzdb';
  timezones: Timezone[];
}

export interface TimezoneRepository {
  getTimezonesCatalog(): ApiPromise<TimezonesCatalog>;
}
