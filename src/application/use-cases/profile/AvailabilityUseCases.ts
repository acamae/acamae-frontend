import {
  AvailabilityRepository,
  AddAvailabilityPayload,
} from '@domain/repositories/profile/AvailabilityRepository';
import { ApiPromise } from '@domain/types/apiSchema';
import { AvailabilityResponse } from '@domain/types/availabilityResponse';

export class AddUserAvailabilityUseCase {
  constructor(private readonly repo: AvailabilityRepository) {}
  async execute(payload: AddAvailabilityPayload): ApiPromise<AvailabilityResponse> {
    return this.repo.addUserAvailability(payload);
  }
}
