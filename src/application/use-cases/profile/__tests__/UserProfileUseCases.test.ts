import { GetUserProfileUseCase } from '@application/use-cases/profile/UserProfileUseCases';
import {
  GetUserProfilePayload,
  UserProfileRepository,
} from '@domain/repositories/profile/UserProfileRepository';

describe('GetUserProfileUseCase', () => {
  it('should delegate to repository.getUserProfile', async () => {
    const repo = {
      getUserProfile: jest.fn().mockResolvedValue({ success: true, data: {} }),
    } as unknown as UserProfileRepository;
    const uc = new GetUserProfileUseCase(repo);
    const payload: GetUserProfilePayload = { userId: '1' };
    const res = await uc.execute(payload);
    expect(repo.getUserProfile).toHaveBeenCalledWith(payload);
    expect(res.success).toBe(true);
  });
});
