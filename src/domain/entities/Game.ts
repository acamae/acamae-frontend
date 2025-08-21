import { Entity } from '@domain/types/entity';

export interface Game extends Entity {
  code: string;
  nameCode: string;
  imageFilename: string;
  descriptionCode: string;
}
