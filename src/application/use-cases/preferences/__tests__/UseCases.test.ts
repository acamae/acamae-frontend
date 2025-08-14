import {
  GetUserAvailabilityUseCase,
  PutUserAvailabilityUseCase,
} from '@application/use-cases/preferences/AvailabilityUseCases';
import { ListGamesUseCase } from '@application/use-cases/preferences/ListGamesUseCase';
import { GetTimezonesCatalogUseCase } from '@application/use-cases/preferences/TimezonesUseCase';
import {
  GetUserGamesUseCase,
  AddUserGameUseCase,
  RemoveUserGameUseCase,
} from '@application/use-cases/preferences/UserGamesUseCases';
import { AvailabilityRepository } from '@domain/repositories/AvailabilityRepository';
import { GameProfileRepository } from '@domain/repositories/GameProfileRepository';

describe('Preferences UseCases', () => {
  it('ListGamesUseCase should delegate to repo', async () => {
    const repo: jest.Mocked<import('@domain/repositories/GameRepository').GameRepository> = {
      findAll: jest.fn().mockResolvedValue({ success: true, data: { games: [] } }),
    };
    const uc = new ListGamesUseCase(repo);
    const res = await uc.execute();
    expect(res.success).toBe(true);
    expect(repo.findAll).toHaveBeenCalled();
  });

  it('GetTimezonesCatalogUseCase should delegate to repo', async () => {
    const repo: jest.Mocked<import('@domain/repositories/TimezoneRepository').TimezoneRepository> =
      {
        getCatalog: jest.fn().mockResolvedValue({ success: true, data: { timezones: [] } }),
      };
    const uc = new GetTimezonesCatalogUseCase(repo);
    const res = await uc.execute();
    expect(res.success).toBe(true);
    expect(repo.getCatalog).toHaveBeenCalled();
  });

  it('Availability use cases should delegate to repo', async () => {
    const repo: jest.Mocked<AvailabilityRepository> = {
      getUserAvailability: jest
        .fn()
        .mockResolvedValue({ success: true, data: { timezone: '', availability: [] } }),
      replaceUserAvailability: jest
        .fn()
        .mockResolvedValue({ success: true, data: { timezone: 'UTC', availability: [] } }),
    } as jest.Mocked<AvailabilityRepository>;
    const getUc = new GetUserAvailabilityUseCase(repo);
    const putUc = new PutUserAvailabilityUseCase(repo);
    expect((await getUc.execute(1)).success).toBe(true);
    expect((await putUc.execute({ userId: 1, windows: [], timezone: 'UTC' })).success).toBe(true);
    expect(repo.getUserAvailability).toHaveBeenCalledWith(1);
    expect(repo.replaceUserAvailability).toHaveBeenCalled();
  });

  it('User games use cases should delegate to repo', async () => {
    const repo: jest.Mocked<GameProfileRepository> = {
      getUserGames: jest.fn().mockResolvedValue({ success: true, data: { games: [] } }),
      addUserGame: jest
        .fn()
        .mockResolvedValue({ success: true, data: { games: [{ code: 'lol' }] } }),
      removeUserGame: jest.fn().mockResolvedValue({ success: true, data: { games: [] } }),
    } as jest.Mocked<GameProfileRepository>;
    expect((await new GetUserGamesUseCase(repo).execute(1)).success).toBe(true);
    expect((await new AddUserGameUseCase(repo).execute(1, 2)).success).toBe(true);
    expect((await new RemoveUserGameUseCase(repo).execute(1, 2)).success).toBe(true);
    expect(repo.getUserGames).toHaveBeenCalledWith(1);
    expect(repo.addUserGame).toHaveBeenCalledWith(1, 2);
    expect(repo.removeUserGame).toHaveBeenCalledWith(1, 2);
  });
});
