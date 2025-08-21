import type { AxiosError } from 'axios';

import {
  AvailabilityRepository,
  AddAvailabilityPayload,
} from '@domain/repositories/profile/AvailabilityRepository';
import { ApiPromise, ApiSuccessResponse, ApiErrorResponse } from '@domain/types/apiSchema';
import { AvailabilityResponse } from '@domain/types/availabilityResponse';
import { getUserAvailabilityUrl } from '@shared/constants/apiRoutes';
import api from '@shared/services/axiosService';

export class AvailabilityProfileApiRepository implements AvailabilityRepository {
  async addUserAvailability(payload: AddAvailabilityPayload): ApiPromise<AvailabilityResponse> {
    try {
      const response = await api.put(getUserAvailabilityUrl(String(payload.userId)), {
        timezone: payload.timezone,
        windows: payload.windows,
      });
      return response.data as ApiSuccessResponse<AvailabilityResponse>;
    } catch (error) {
      const e = error as AxiosError;
      return (
        (e.response?.data as ApiErrorResponse<AvailabilityResponse>) ?? {
          success: false,
          data: null,
          status: 0,
          code: 'ERR_NETWORK',
          message: e.message,
          timestamp: new Date().toISOString(),
          requestId: 'req-add-availability',
        }
      );
    }
  }
}
