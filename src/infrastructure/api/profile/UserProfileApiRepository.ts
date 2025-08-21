import { AxiosError } from 'axios';

import {
  GetUserProfilePayload,
  UserProfileRepository,
} from '@domain/repositories/profile/UserProfileRepository';
import { ApiErrorResponse, ApiPromise, ApiSuccessResponse } from '@domain/types/apiSchema';
import { Profile } from '@domain/types/publicProfile';
import { getUserProfileUrl } from '@shared/constants/apiRoutes';
import api from '@shared/services/axiosService';

export class UserProfileApiRepository implements UserProfileRepository {
  async getUserProfile(payload: GetUserProfilePayload): ApiPromise<Profile> {
    try {
      const response = await api.get(getUserProfileUrl(String(payload.userId)));
      return response.data as ApiSuccessResponse<Profile>;
    } catch (error) {
      const e = error as AxiosError;
      return (
        (e.response?.data as ApiErrorResponse<Profile>) ?? {
          success: false,
          data: null,
          status: 0,
          code: 'ERR_NETWORK',
          message: e.message,
          timestamp: new Date().toISOString(),
          requestId: 'req-get-profile',
        }
      );
    }
  }

  // PUT /profiles/:id/public is not supported per Swagger
}
