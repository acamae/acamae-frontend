import { GameProfileApiRepository } from '@infrastructure/api/profile/GameProfileApiRepository';
import api from '@shared/services/axiosService';

jest.mock('@shared/services/axiosService');

describe('GameProfileApiRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('addUserGame should map api error when AxiosError has response', async () => {
    (api.put as unknown as jest.Mock).mockRejectedValueOnce({
      response: { data: { success: false, data: null, code: 'ERR' } },
      message: 'Boom',
    });
    const repo = new GameProfileApiRepository();
    const res = await repo.addUserGame({ userId: 1, gameId: 2 });
    expect(res.success).toBe(false);
    expect(res.code).toBe('ERR');
  });

  it('addUserGame should map network error when AxiosError has no response', async () => {
    (api.put as unknown as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    const repo = new GameProfileApiRepository();
    const res = await repo.addUserGame({ userId: 1, gameId: 2 });
    expect(res.success).toBe(false);
    expect(res.code).toBe('ERR_NETWORK');
  });

  it('removeUserGame should map api error when AxiosError has response', async () => {
    (api.delete as unknown as jest.Mock).mockRejectedValueOnce({
      response: { data: { success: false, data: null, code: 'ERR' } },
      message: 'Boom',
    });
    const repo = new GameProfileApiRepository();
    const res = await repo.removeUserGame({ userId: 1, gameId: 2 });
    expect(res.success).toBe(false);
    expect(res.code).toBe('ERR');
  });

  it('removeUserGame should map network error when AxiosError has no response', async () => {
    (api.delete as unknown as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    const repo = new GameProfileApiRepository();
    const res = await repo.removeUserGame({ userId: 1, gameId: 2 });
    expect(res.success).toBe(false);
    expect(res.code).toBe('ERR_NETWORK');
  });
});
