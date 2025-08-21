import {
  PutUserCountryPayload,
  PutUserCountryResponse,
  UserCountryRepository,
} from '@domain/repositories/profile/UserCountryRepository';
import { ApiPromise } from '@domain/types/apiSchema';

export class PutUserCountryUseCase {
  constructor(private readonly repo: UserCountryRepository) {}
  async execute(payload: PutUserCountryPayload): ApiPromise<PutUserCountryResponse> {
    return this.repo.putUserCountry(payload);
  }
}
