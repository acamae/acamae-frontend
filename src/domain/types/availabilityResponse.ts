import { AvailabilityWindow } from '@domain/types/availabilityWindow';

export type AvailabilityResponse = {
  timezone: string | null;
  availability: AvailabilityWindow[];
};
