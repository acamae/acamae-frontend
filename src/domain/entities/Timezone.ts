import { Entity } from '@domain/types/entity';

export interface Timezone extends Entity {
  id: string; // IANA id, e.g., Europe/Madrid
  altName: string | null;
  countryCode: string | null;
  countryName: string;
  continentCode: string;
  continentName: string;
  group: string[];
  utcOffset: string;
  isDST: boolean | null;
}
