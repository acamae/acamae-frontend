import { ApiPromise } from '@domain/types/apiSchema';

export interface GetUserTimezonePayload {
  userId: string | number;
}

export interface PutUserTimezonePayload {
  userId: string | number;
  timezone: string;
}

export interface GetUserTimezoneResponse {
  timezone: string | null;
  profileIsActive: boolean;
}

export interface PutUserTimezoneResponse {
  timezone: string | null;
  profileIsActive: boolean;
}

export interface UserTimezoneRepository {
  putUserTimezone(payload: PutUserTimezonePayload): ApiPromise<PutUserTimezoneResponse>;
}
