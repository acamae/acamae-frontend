import { ApiPromise } from '@domain/types/apiSchema';
import { AvailabilityResponse } from '@domain/types/availabilityResponse';
import { AvailabilityWindow } from '@domain/types/availabilityWindow';

export interface AddAvailabilityPayload {
  userId: string | number;
  timezone?: string;
  windows: AvailabilityWindow[];
}

export interface AvailabilityRepository {
  addUserAvailability(payload: AddAvailabilityPayload): ApiPromise<AvailabilityResponse>;
}
