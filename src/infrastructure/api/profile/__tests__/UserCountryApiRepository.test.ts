import { UserCountryApiRepository } from '@infrastructure/api/profile/UserCountryApiRepository';
import api from '@shared/services/axiosService';

jest.mock('@shared/services/axiosService');

describe('UserCountryApiRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return success on put', async () => {
    (api.put as unknown as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { countryCode: 'ES' } },
    });
    const repo = new UserCountryApiRepository();
    const res = await repo.putUserCountry({ userId: 1, countryCode: 'ES' });
    expect(res.success).toBe(true);
  });

  it('should map api error when AxiosError has response', async () => {
    (api.put as unknown as jest.Mock).mockRejectedValueOnce({
      response: { data: { success: false, data: null, code: 'ERR' } },
      message: 'Boom',
    });
    const repo = new UserCountryApiRepository();
    const res = await repo.putUserCountry({ userId: 1, countryCode: 'ES' });
    expect(res.success).toBe(false);
    expect(res.code).toBe('ERR');
  });

  it('should map network error when AxiosError has no response', async () => {
    (api.put as unknown as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    const repo = new UserCountryApiRepository();
    const res = await repo.putUserCountry({ userId: 1, countryCode: 'ES' });
    expect(res.success).toBe(false);
    expect(res.code).toBe('ERR_NETWORK');
  });
});
