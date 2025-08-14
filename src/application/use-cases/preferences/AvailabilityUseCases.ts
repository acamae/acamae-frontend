import {
  AvailabilityRepository,
  AvailabilityResponse,
  ReplaceAvailabilityPayload,
} from '@domain/repositories/AvailabilityRepository';
import { ApiPromise } from '@domain/types/apiSchema';

export class GetUserAvailabilityUseCase {
  constructor(private readonly repo: AvailabilityRepository) {}
  async execute(userId: string | number): ApiPromise<AvailabilityResponse> {
    return this.repo.getUserAvailability(userId);
  }
}

export class PutUserAvailabilityUseCase {
  constructor(private readonly repo: AvailabilityRepository) {}
  async execute(payload: ReplaceAvailabilityPayload): ApiPromise<AvailabilityResponse> {
    return this.repo.replaceUserAvailability(payload);
  }
}
