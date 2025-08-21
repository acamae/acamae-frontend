import {
  TimezonesCatalog,
  TimezoneRepository,
} from '@domain/repositories/catalogs/TimezoneRepository';
import { ApiPromise } from '@domain/types/apiSchema';

export class GetTimezonesCatalogUseCase {
  constructor(private readonly repo: TimezoneRepository) {}
  async execute(): ApiPromise<TimezonesCatalog> {
    return this.repo.getTimezonesCatalog();
  }
}
