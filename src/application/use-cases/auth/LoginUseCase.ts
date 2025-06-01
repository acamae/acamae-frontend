import { User } from '@domain/entities/User';
import { AuthRepository } from '@domain/repositories/AuthRepository';
import { ApiPromise, LoginPayload } from '@domain/types/apiSchema';

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(payload: LoginPayload): ApiPromise<User> {
    return await this.authRepository.login(payload);
  }
}
