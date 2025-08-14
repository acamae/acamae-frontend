import type { AxiosError } from 'axios';

import {
  AvailabilityRepository,
  AvailabilityResponse,
  ReplaceAvailabilityPayload,
} from '@domain/repositories/AvailabilityRepository';
import { ApiPromise, ApiSuccessResponse, ApiErrorResponse } from '@domain/types/apiSchema';
import { getUserAvailabilityUrl } from '@shared/constants/apiRoutes';
import api from '@shared/services/axiosService';

export class AvailabilityApiRepository implements AvailabilityRepository {
  async getUserAvailability(userId: string | number): ApiPromise<AvailabilityResponse> {
    try {
      const response = await api.get(getUserAvailabilityUrl(String(userId)));
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
          requestId: 'req-get-availability',
        }
      );
    }
  }

  async replaceUserAvailability(
    payload: ReplaceAvailabilityPayload
  ): ApiPromise<AvailabilityResponse> {
    try {
      const response = await api.put(getUserAvailabilityUrl(String(payload.userId)), payload);
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
          requestId: 'req-put-availability',
        }
      );
    }
  }
}
