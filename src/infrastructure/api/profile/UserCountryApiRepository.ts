import { AxiosError } from 'axios';

import {
  PutUserCountryPayload,
  PutUserCountryResponse,
  UserCountryRepository,
} from '@domain/repositories/profile/UserCountryRepository';
import { ApiErrorResponse, ApiPromise, ApiSuccessResponse } from '@domain/types/apiSchema';
import { getUserCountryUrl } from '@shared/constants/apiRoutes';
import api from '@shared/services/axiosService';

export class UserCountryApiRepository implements UserCountryRepository {
  async putUserCountry(payload: PutUserCountryPayload): ApiPromise<PutUserCountryResponse> {
    try {
      const response = await api.put(getUserCountryUrl(String(payload.userId)), {
        countryCode: payload.countryCode,
      });
      return response.data as ApiSuccessResponse<PutUserCountryResponse>;
    } catch (error) {
      const e = error as AxiosError;
      return (
        (e.response?.data as ApiErrorResponse<PutUserCountryResponse>) ?? {
          success: false,
          data: null,
          status: 0,
          code: 'ERR_NETWORK',
          message: e.message,
          timestamp: new Date().toISOString(),
          requestId: 'req-put-country',
        }
      );
    }
  }
}
