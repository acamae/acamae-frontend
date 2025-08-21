import { UserProfileApiRepository } from '@infrastructure/api/profile/UserProfileApiRepository';
import api from '@shared/services/axiosService';

jest.mock('@shared/services/axiosService');

describe('UserProfileApiRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return profile on success', async () => {
    (api.get as unknown as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: { games: [{ id: 1, code: 'lol' }], timezone: 'UTC', availability: [] },
      },
    });
    const repo = new UserProfileApiRepository();
    const res = await repo.getUserProfile({ userId: '1' });
    expect(res.success).toBe(true);
    expect((res.data as { games?: Array<{ id?: number }> } | null)?.games?.[0]?.id).toBe(1);
  });

  it('should map api error when AxiosError has response', async () => {
    (api.get as unknown as jest.Mock).mockRejectedValueOnce({
      response: { data: { success: false, data: null, code: 'ERR' } },
      message: 'Boom',
    });
    const repo = new UserProfileApiRepository();
    const res = await repo.getUserProfile({ userId: '1' });
    expect(res.success).toBe(false);
    expect(res.code).toBe('ERR');
  });

  it('should map network error when AxiosError has no response', async () => {
    (api.get as unknown as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    const repo = new UserProfileApiRepository();
    const res = await repo.getUserProfile({ userId: '1' });
    expect(res.success).toBe(false);
    expect(res.code).toBe('ERR_NETWORK');
  });
});
