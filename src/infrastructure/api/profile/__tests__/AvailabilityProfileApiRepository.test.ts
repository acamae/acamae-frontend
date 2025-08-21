import { AvailabilityProfileApiRepository } from '@infrastructure/api/profile/AvailabilityProfileApiRepository';

jest.mock('@shared/services/axiosService', () => ({
  __esModule: true,
  default: { put: jest.fn() },
}));

describe('AvailabilityProfileApiRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('addUserAvailability returns success on 200', async () => {
    const api = require('@shared/services/axiosService').default;
    api.put.mockResolvedValueOnce({
      data: { success: true, data: { timezone: 'UTC', windows: [] } },
    });

    const repo = new AvailabilityProfileApiRepository();
    const res = await repo.addUserAvailability({ userId: 1, timezone: 'UTC', windows: [] });
    expect(res.success).toBe(true);
    expect(res.data?.timezone).toBe('UTC');
  });

  it('addUserAvailability maps server error when AxiosError has response', async () => {
    const api = require('@shared/services/axiosService').default;
    api.put.mockRejectedValueOnce({
      response: {
        data: { success: false, data: null, status: 400, code: 'INVALID', message: 'bad' },
      },
      message: 'bad',
    });

    const repo = new AvailabilityProfileApiRepository();
    const res = await repo.addUserAvailability({ userId: 1, timezone: 'UTC', windows: [] });
    expect(res.success).toBe(false);
    expect(res.code).toBe('INVALID');
  });

  it('addUserAvailability returns fallback error when no response in AxiosError', async () => {
    const api = require('@shared/services/axiosService').default;
    api.put.mockRejectedValueOnce({ message: 'offline' });

    const repo = new AvailabilityProfileApiRepository();
    const res = await repo.addUserAvailability({ userId: 1, timezone: 'UTC', windows: [] });
    expect(res.success).toBe(false);
    expect(res.status).toBe(0);
    expect(res.code).toBe('ERR_NETWORK');
  });
});
