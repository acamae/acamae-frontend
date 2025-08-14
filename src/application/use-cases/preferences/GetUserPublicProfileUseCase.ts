import { Game } from '@domain/entities/Game';
import { ApiPromise } from '@domain/types/apiSchema';
import { getUserPublicProfileUrl } from '@shared/constants/apiRoutes';
import api from '@shared/services/axiosService';

type PublicProfile = { user: unknown; games: Game[]; timezone: string; availability: unknown };

export class GetUserPublicProfileUseCase {
  async execute(userId: string): ApiPromise<PublicProfile> {
    const response = await api.get(getUserPublicProfileUrl(userId));
    return response.data;
  }
}
