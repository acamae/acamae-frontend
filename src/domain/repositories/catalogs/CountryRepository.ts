import { Country } from '@domain/entities/Country';
import { ApiPromise } from '@domain/types/apiSchema';

export interface CountryRepository {
  getCountriesCatalog(): ApiPromise<{ countries: Country[] }>;
}
