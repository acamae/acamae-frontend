import { CountriesCatalogApiRepository } from '@infrastructure/api/catalogs/CountriesCatalogApiRepository';
import api from '@shared/services/axiosService';

jest.mock('@shared/services/axiosService');

describe('CountriesCatalogApiRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return countries on success', async () => {
    (api.get as unknown as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { countries: [{ code: 'ES', nameCode: 'country.es' }] } },
    });
    const repo = new CountriesCatalogApiRepository();
    const res = await repo.getCountriesCatalog();
    expect(res.success).toBe(true);
    expect(res.data?.countries?.[0]?.code).toBe('ES');
  });

  it('should map api error when AxiosError has response', async () => {
    (api.get as unknown as jest.Mock).mockRejectedValueOnce({
      response: { data: { success: false, data: null, code: 'ERR', status: 500 } },
      message: 'Boom',
    });
    const repo = new CountriesCatalogApiRepository();
    const res = await repo.getCountriesCatalog();
    expect(res.success).toBe(false);
    expect(res.code).toBe('ERR');
  });

  it('should map network error when AxiosError has no response', async () => {
    (api.get as unknown as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    const repo = new CountriesCatalogApiRepository();
    const res = await repo.getCountriesCatalog();
    expect(res.success).toBe(false);
    expect(res.code).toBe('ERR_NETWORK');
  });
});
