import { GamesCatalogApiRepository } from '@infrastructure/api/catalogs/GamesCatalogApiRepository';
import { TimezonesCatalogApiRepository } from '@infrastructure/api/catalogs/TimezonesCatalogApiRepository';
import { AvailabilityProfileApiRepository } from '@infrastructure/api/profile/AvailabilityProfileApiRepository';
import { GameProfileApiRepository } from '@infrastructure/api/profile/GameProfileApiRepository';
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

    const repo = new GamesCatalogApiRepository();
    const ok = await repo.getGamesCatalog();
    expect(ok.success).toBe(true);
    const ko = await repo.getGamesCatalog();
    expect(ko.success).toBe(false);
  });

  it('GameProfileApiRepository should support add/remove user games', async () => {
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
    const add = await repo.addUserGame({ userId: 1, gameId: 2 });
    expect(add.success).toBe(true);
    const rem = await repo.removeUserGame({ userId: 1, gameId: 2 });
    expect(rem.success).toBe(true);
  });

  it('AvailabilityApiRepository should get availability', async () => {
    (api.get as unknown as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { timezone: 'Europe/Madrid', availability: [] } },
    });
    (api.put as unknown as jest.Mock) = jest.fn().mockResolvedValueOnce({
      data: { success: true, data: { timezone: 'UTC', availability: [] } },
    });

    const repo = new AvailabilityProfileApiRepository();
    const get = await repo.addUserAvailability({ userId: 1, windows: [], timezone: 'UTC' });
    expect(get.success).toBe(true);
  });

  it('TimezonesApiRepository should return catalog and map error', async () => {
    (api.get as unknown as jest.Mock)
      .mockResolvedValueOnce({ data: { success: true, data: { timezones: [{ id: 'UTC' }] } } })
      .mockRejectedValueOnce({ response: { data: { success: false, data: null, code: 'ERR' } } });
    const repo = new TimezonesCatalogApiRepository();
    const ok = await repo.getTimezonesCatalog();
    expect(ok.success).toBe(true);
    const ko = await repo.getTimezonesCatalog();
    expect(ko.success).toBe(false);
  });

  it('Repositories should handle network error without response gracefully', async () => {
    (api.get as unknown as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    const tzRepo = new TimezonesCatalogApiRepository();
    const tz = await tzRepo.getTimezonesCatalog();
    expect(tz.success).toBe(false);

    (api.get as unknown as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    const gamesRepo = new GamesCatalogApiRepository();
    const gr = await gamesRepo.getGamesCatalog();
    expect(gr.success).toBe(false);

    // getUserGames removed
  });
});
