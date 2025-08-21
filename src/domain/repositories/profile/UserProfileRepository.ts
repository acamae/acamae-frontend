import { ApiPromise } from '@domain/types/apiSchema';
import { Profile } from '@domain/types/publicProfile';

export interface GetUserProfilePayload {
  userId: string;
}

export interface UserProfileRepository {
  getUserProfile(payload: GetUserProfilePayload): ApiPromise<Profile>;
}
