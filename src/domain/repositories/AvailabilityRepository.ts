import { AvailabilityWindow } from '@domain/entities/AvailabilityWindow';
import { ApiPromise } from '@domain/types/apiSchema';

export interface AvailabilityResponse {
  timezone: string;
  availability: AvailabilityWindow[];
}

export interface ReplaceAvailabilityPayload {
  userId: string | number;
  timezone?: string;
  windows: AvailabilityWindow[];
}

export interface AvailabilityRepository {
  getUserAvailability(userId: string | number): ApiPromise<AvailabilityResponse>;
  replaceUserAvailability(payload: ReplaceAvailabilityPayload): ApiPromise<AvailabilityResponse>;
}
