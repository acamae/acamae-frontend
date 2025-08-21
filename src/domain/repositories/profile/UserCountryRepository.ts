import { Country } from '@domain/entities/Country';
import { ApiPromise } from '@domain/types/apiSchema';

export interface PutUserCountryPayload {
  userId: string | number;
  countryCode: string;
}

export interface PutUserCountryResponse {
  country: string | Country;
  profileIsActive?: boolean;
}

export interface UserCountryRepository {
  putUserCountry(payload: PutUserCountryPayload): ApiPromise<PutUserCountryResponse>;
}
