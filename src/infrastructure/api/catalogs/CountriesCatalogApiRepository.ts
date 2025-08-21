import type { AxiosError } from 'axios';

import { Country } from '@domain/entities/Country';
import { CountryRepository } from '@domain/repositories/catalogs/CountryRepository';
import { ApiErrorResponse, ApiPromise, ApiSuccessResponse } from '@domain/types/apiSchema';
import { API_ROUTES } from '@shared/constants/apiRoutes';
import api from '@shared/services/axiosService';

export class CountriesCatalogApiRepository implements CountryRepository {
  async getCountriesCatalog(): ApiPromise<{ countries: Country[] }> {
    try {
      const response = await api.get(`${API_ROUTES.BASE}${API_ROUTES.COUNTRIES}`);
      return response.data as ApiSuccessResponse<{ countries: Country[] }>;
    } catch (error) {
      const e = error as AxiosError;
      return (
        (e.response?.data as ApiErrorResponse<{ countries: Country[] }>) ?? {
          success: false,
          data: null,
          status: 0,
          code: 'ERR_NETWORK',
          message: e.message,
          timestamp: new Date().toISOString(),
          requestId: 'req-countries-findall',
        }
      );
    }
  }
}
