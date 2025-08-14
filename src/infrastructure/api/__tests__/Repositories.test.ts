import { AvailabilityApiRepository } from '@infrastructure/api/AvailabilityApiRepository';
import { GameProfileApiRepository } from '@infrastructure/api/GameProfileApiRepository';
import { GamesApiRepository } from '@infrastructure/api/GamesApiRepository';
import { TimezonesApiRepository } from '@infrastructure/api/TimezonesApiRepository';
import api from '@shared/services/axiosService';

jest.mock('@shared/services/axiosService');

describe('Infrastructure API Repositories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GamesApiRepository.findAll should return games on success and map error on failure', async () => {
    (api.get as unknown as jest.Mock)
      .mockResolvedValueOnce({ data: { success: true, data: { games: [{ id: 1, code: 'lol' }] } } })
      .mockRejectedValueOnce({ response: { data: { success: false, data: null, code: 'ERR' } } });

    const repo = new GamesApiRepository();
    const ok = await repo.findAll();
    expect(ok.success).toBe(true);
    const ko = await repo.findAll();
    expect(ko.success).toBe(false);
  });

  it('GameProfileApiRepository should support get/add/remove user games', async () => {
    (api.get as unknown as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { games: [{ id: 1, code: 'lol' }] } },
    });
    (api.put as unknown as jest.Mock) = jest.fn().mockResolvedValueOnce({
      data: {
        success: true,
        data: { gameId: 2, selected: true, profileIsActive: true },
      },
    });
    (api.delete as unknown as jest.Mock) = jest.fn().mockResolvedValueOnce({
      data: { success: true, data: { gameId: 2, selected: false, profileIsActive: false } },
    });

    const repo = new GameProfileApiRepository();
    const list = await repo.getUserGames(1);
    expect(list.success).toBe(true);
    const add = await repo.addUserGame(1, 2);
    expect(add.success).toBe(true);
    const rem = await repo.removeUserGame(1, 2);
    expect(rem.success).toBe(true);
  });

  it('AvailabilityApiRepository should get and replace availability', async () => {
    (api.get as unknown as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { timezone: 'Europe/Madrid', availability: [] } },
    });
    (api.put as unknown as jest.Mock) = jest.fn().mockResolvedValueOnce({
      data: { success: true, data: { timezone: 'UTC', availability: [] } },
    });

    const repo = new AvailabilityApiRepository();
    const get = await repo.getUserAvailability(1);
    expect(get.success).toBe(true);
    const put = await repo.replaceUserAvailability({ userId: 1, windows: [], timezone: 'UTC' });
    expect(put.success).toBe(true);
  });

  it('TimezonesApiRepository should return catalog and map error', async () => {
    (api.get as unknown as jest.Mock)
      .mockResolvedValueOnce({ data: { success: true, data: { timezones: [{ id: 'UTC' }] } } })
      .mockRejectedValueOnce({ response: { data: { success: false, data: null, code: 'ERR' } } });
    const repo = new TimezonesApiRepository();
    const ok = await repo.getCatalog();
    expect(ok.success).toBe(true);
    const ko = await repo.getCatalog();
    expect(ko.success).toBe(false);
  });

  it('Repositories should handle network error without response gracefully', async () => {
    (api.get as unknown as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    const tzRepo = new TimezonesApiRepository();
    const tz = await tzRepo.getCatalog();
    expect(tz.success).toBe(false);

    (api.get as unknown as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    const gamesRepo = new GamesApiRepository();
    const gr = await gamesRepo.findAll();
    expect(gr.success).toBe(false);

    (api.get as unknown as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    const gpRepo = new GameProfileApiRepository();
    const gpl = await gpRepo.getUserGames(1);
    expect(gpl.success).toBe(false);

    (api.put as unknown as jest.Mock) = jest.fn().mockRejectedValueOnce(new Error('offline'));
    const apRepo = new AvailabilityApiRepository();
    const apr = await apRepo.replaceUserAvailability({ userId: 1, windows: [] });
    expect(apr.success).toBe(false);
  });
});
