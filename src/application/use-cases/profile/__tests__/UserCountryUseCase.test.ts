import { PutUserCountryUseCase } from '@application/use-cases/profile/UserCountryUseCase';
import {
  PutUserCountryPayload,
  UserCountryRepository,
} from '@domain/repositories/profile/UserCountryRepository';

describe('PutUserCountryUseCase', () => {
  it('should delegate to repo.putUserCountry', async () => {
    const repo = {
      putUserCountry: jest.fn().mockResolvedValue({ success: true, data: {} }),
    } as unknown as UserCountryRepository;
    const uc = new PutUserCountryUseCase(repo);
    const payload: PutUserCountryPayload = { userId: 1, countryCode: 'ES' };
    const res = await uc.execute(payload);
    expect(repo.putUserCountry).toHaveBeenCalledWith(payload);
    expect(res.success).toBe(true);
  });
});
