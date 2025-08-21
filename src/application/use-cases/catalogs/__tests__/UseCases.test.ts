import { GetGamesCatalogUseCase } from '@application/use-cases/catalogs/GamesCatalogUseCase';
import { GetTimezonesCatalogUseCase } from '@application/use-cases/catalogs/TimezonesCatalogUseCase';
import { AddUserAvailabilityUseCase } from '@application/use-cases/profile/AvailabilityUseCases';
import {
  AddUserGameUseCase,
  RemoveUserGameUseCase,
} from '@application/use-cases/profile/UserGamesUseCases';
import { AvailabilityRepository } from '@domain/repositories/profile/AvailabilityRepository';
import { GameProfileRepository } from '@domain/repositories/profile/GameProfileRepository';

describe('Preferences UseCases', () => {
  it('ListGamesUseCase should delegate to repo', async () => {
    const repo: jest.Mocked<import('@domain/repositories/catalogs/GameRepository').GameRepository> =
      {
        getGamesCatalog: jest.fn().mockResolvedValue({ success: true, data: { games: [] } }),
      };
    const uc = new GetGamesCatalogUseCase(repo);
    const res = await uc.execute();
    expect(res.success).toBe(true);
    expect(repo.getGamesCatalog).toHaveBeenCalled();
  });

  it('GetTimezonesCatalogUseCase should delegate to repo', async () => {
    const repo: jest.Mocked<
      import('@domain/repositories/catalogs/TimezoneRepository').TimezoneRepository
    > = {
      getTimezonesCatalog: jest.fn().mockResolvedValue({ success: true, data: { timezones: [] } }),
    };
    const uc = new GetTimezonesCatalogUseCase(repo);
    const res = await uc.execute();
    expect(res.success).toBe(true);
    expect(repo.getTimezonesCatalog).toHaveBeenCalled();
  });

  it('Availability use cases should delegate to repo (PUT)', async () => {
    const repo: jest.Mocked<AvailabilityRepository> = {
      addUserAvailability: jest
        .fn()
        .mockResolvedValue({ success: true, data: { timezone: 'UTC', availability: [] } }),
    } as jest.Mocked<AvailabilityRepository>;
    const addUc = new AddUserAvailabilityUseCase(repo);
    expect((await addUc.execute({ userId: 1, windows: [], timezone: 'UTC' })).success).toBe(true);
    expect(repo.addUserAvailability).toHaveBeenCalled();
  });

  it('User games use cases should delegate to repo (mutations only)', async () => {
    const repo: jest.Mocked<GameProfileRepository> = {
      addUserGame: jest
        .fn()
        .mockResolvedValue({ success: true, data: { games: [{ code: 'lol' }] } }),
      removeUserGame: jest.fn().mockResolvedValue({ success: true, data: { games: [] } }),
    } as jest.Mocked<GameProfileRepository>;
    expect((await new AddUserGameUseCase(repo).execute({ userId: 1, gameId: 2 })).success).toBe(
      true
    );
    expect((await new RemoveUserGameUseCase(repo).execute({ userId: 1, gameId: 2 })).success).toBe(
      true
    );
    expect(repo.addUserGame).toHaveBeenCalledWith({ userId: 1, gameId: 2 });
    expect(repo.removeUserGame).toHaveBeenCalledWith({ userId: 1, gameId: 2 });
  });
});
