import { PutUserTimezoneUseCase } from '@application/use-cases/profile/UserTimezoneUseCases';
import {
  PutUserTimezonePayload,
  UserTimezoneRepository,
} from '@domain/repositories/profile/UserTimezoneRepository';

describe('PutUserTimezoneUseCase', () => {
  it('should delegate to repo.putUserTimezone', async () => {
    const repo = {
      putUserTimezone: jest.fn().mockResolvedValue({ success: true, data: {} }),
    } as unknown as UserTimezoneRepository;
    const uc = new PutUserTimezoneUseCase(repo);
    const payload: PutUserTimezonePayload = { userId: 1, timezone: 'UTC' };
    const res = await uc.execute(payload);
    expect(repo.putUserTimezone).toHaveBeenCalledWith(payload);
    expect(res.success).toBe(true);
  });
});
