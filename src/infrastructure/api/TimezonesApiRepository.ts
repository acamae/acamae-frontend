import type { AxiosError } from 'axios';

import { TimezoneRepository, TimezonesCatalog } from '@domain/repositories/TimezoneRepository';
import { ApiPromise, ApiSuccessResponse, ApiErrorResponse } from '@domain/types/apiSchema';
import { API_ROUTES } from '@shared/constants/apiRoutes';
import api from '@shared/services/axiosService';

export class TimezonesApiRepository implements TimezoneRepository {
  async getCatalog(): ApiPromise<TimezonesCatalog> {
    try {
      const response = await api.get(`${API_ROUTES.BASE}${API_ROUTES.TIMEZONES}`);
      return response.data as ApiSuccessResponse<TimezonesCatalog>;
    } catch (error) {
      const e = error as AxiosError;
      return (
        (e.response?.data as ApiErrorResponse<TimezonesCatalog>) ?? {
          success: false,
          data: null,
          status: 0,
          code: 'ERR_NETWORK',
          message: e.message,
          timestamp: new Date().toISOString(),
          requestId: 'req-timezones',
        }
      );
    }
  }
}
