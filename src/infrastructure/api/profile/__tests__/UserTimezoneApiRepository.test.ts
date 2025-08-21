import { UserTimezoneApiRepository } from '@infrastructure/api/profile/UserTimezoneApiRepository';
import api from '@shared/services/axiosService';

jest.mock('@shared/services/axiosService');

describe('UserTimezoneApiRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return success on put', async () => {
    (api.put as unknown as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { timezone: 'UTC' } },
    });
    const repo = new UserTimezoneApiRepository();
    const res = await repo.putUserTimezone({ userId: 1, timezone: 'UTC' });
    expect(res.success).toBe(true);
  });

  it('should map api error when AxiosError has response', async () => {
    (api.put as unknown as jest.Mock).mockRejectedValueOnce({
      response: { data: { success: false, data: null, code: 'ERR' } },
      message: 'Boom',
    });
    const repo = new UserTimezoneApiRepository();
    const res = await repo.putUserTimezone({ userId: 1, timezone: 'UTC' });
    expect(res.success).toBe(false);
    expect(res.code).toBe('ERR');
  });

  it('should map network error when AxiosError has no response', async () => {
    (api.put as unknown as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    const repo = new UserTimezoneApiRepository();
    const res = await repo.putUserTimezone({ userId: 1, timezone: 'UTC' });
    expect(res.success).toBe(false);
    expect(res.code).toBe('ERR_NETWORK');
  });
});
