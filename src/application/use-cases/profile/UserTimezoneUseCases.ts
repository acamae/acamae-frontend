import {
  PutUserTimezonePayload,
  PutUserTimezoneResponse,
  UserTimezoneRepository,
} from '@domain/repositories/profile/UserTimezoneRepository';
import { ApiPromise } from '@domain/types/apiSchema';

export class PutUserTimezoneUseCase {
  constructor(private readonly repo: UserTimezoneRepository) {}
  async execute(payload: PutUserTimezonePayload): ApiPromise<PutUserTimezoneResponse> {
    return this.repo.putUserTimezone(payload);
  }
}
