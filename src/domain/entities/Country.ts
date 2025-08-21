import { Entity } from '@domain/types/entity';

export interface Country extends Entity {
  code: string;
  name: string;
}
