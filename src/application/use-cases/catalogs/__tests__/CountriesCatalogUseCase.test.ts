import { GetCountriesCatalogUseCase } from '@application/use-cases/catalogs/CountriesCatalogUseCase';
import { CountryRepository } from '@domain/repositories/catalogs/CountryRepository';

describe('GetCountriesCatalogUseCase', () => {
  it('should delegate to repo.getCountriesCatalog', async () => {
    const repo = {
      getCountriesCatalog: jest.fn().mockResolvedValue({ success: true, data: {} }),
    } as unknown as CountryRepository;
    const uc = new GetCountriesCatalogUseCase(repo);
    const res = await uc.execute();
    expect(repo.getCountriesCatalog).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });
});
