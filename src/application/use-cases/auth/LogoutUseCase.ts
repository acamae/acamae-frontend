import { ApiPromise } from '@/domain/types/apiSchema';
import { AuthRepository } from '@domain/repositories/AuthRepository';

export class LogoutUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): ApiPromise<void> {
    return await this.authRepository.logout();
  }
}
