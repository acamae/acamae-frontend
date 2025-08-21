import { AvailabilityWindow } from '@domain/types/availabilityWindow';

export interface ProfileState {
  profileId: string | number | null;
  country?: string | null;
  timezone?: string | null;
  availability: AvailabilityWindow[];
  games: number[]; // selected game IDs only
  profileIsActive?: boolean;
  loading: boolean;
  error?: string;
  loadedAt?: number | null;
}
