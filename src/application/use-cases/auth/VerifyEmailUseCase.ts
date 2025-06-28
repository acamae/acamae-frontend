import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { ApiPromise } from '@domain/types/apiSchema';

export class VerifyEmailUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(token: string): ApiPromise<void> {
    return await this.authRepository.verifyEmail(token);
  }
}
