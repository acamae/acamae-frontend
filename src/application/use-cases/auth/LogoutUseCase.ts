import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { ApiPromise } from '@domain/types/apiSchema';

export class LogoutUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): ApiPromise<void> {
    return await this.authRepository.logout();
  }
}
