import { User } from '@domain/entities/User';
import { IAuthRepository } from '@domain/repositories/auth/AuthRepository';
import { ApiPromise, VerifyEmailPayload } from '@domain/types/apiSchema';

export class VerifyEmailUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(payload: VerifyEmailPayload): ApiPromise<User> {
    return await this.authRepository.verifyEmail(payload);
  }
}
