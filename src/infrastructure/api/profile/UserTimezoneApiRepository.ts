import { AxiosError } from 'axios';

import {
  PutUserTimezonePayload,
  PutUserTimezoneResponse,
  UserTimezoneRepository,
} from '@domain/repositories/profile/UserTimezoneRepository';
import { ApiErrorResponse, ApiPromise, ApiSuccessResponse } from '@domain/types/apiSchema';
import { getUserTimezoneUrl } from '@shared/constants/apiRoutes';
import api from '@shared/services/axiosService';

export class UserTimezoneApiRepository implements UserTimezoneRepository {
  async putUserTimezone(payload: PutUserTimezonePayload): ApiPromise<PutUserTimezoneResponse> {
    try {
      const response = await api.put(getUserTimezoneUrl(String(payload.userId)), {
        timezone: payload.timezone,
      });
      return response.data as ApiSuccessResponse<PutUserTimezoneResponse>;
    } catch (error) {
      const e = error as AxiosError;
      return (
        (e.response?.data as ApiErrorResponse<PutUserTimezoneResponse>) ?? {
          success: false,
          data: null,
          status: 0,
          code: 'ERR_NETWORK',
          message: e.message,
          timestamp: new Date().toISOString(),
          requestId: 'req-put-timezone',
        }
      );
    }
  }
}
