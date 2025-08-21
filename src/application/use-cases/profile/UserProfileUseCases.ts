import {
  GetUserProfilePayload,
  UserProfileRepository,
} from '@domain/repositories/profile/UserProfileRepository';
import { ApiPromise } from '@domain/types/apiSchema';
import { Profile } from '@domain/types/publicProfile';

export class GetUserProfileUseCase {
  constructor(private readonly repo: UserProfileRepository) {}
  async execute(payload: GetUserProfilePayload): ApiPromise<Profile> {
    return this.repo.getUserProfile(payload);
  }
}
