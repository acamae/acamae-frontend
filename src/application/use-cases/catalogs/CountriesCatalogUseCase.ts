import { Country } from '@domain/entities/Country';
import { CountryRepository } from '@domain/repositories/catalogs/CountryRepository';
import { ApiPromise } from '@domain/types/apiSchema';

export class GetCountriesCatalogUseCase {
  constructor(private readonly repo: CountryRepository) {}
  async execute(): ApiPromise<{ countries: Country[] }> {
    return this.repo.getCountriesCatalog();
  }
}
