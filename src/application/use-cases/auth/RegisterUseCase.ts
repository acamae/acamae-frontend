import { User } from '@domain/entities/User';
import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { ApiPromise, RegisterPayload } from '@domain/types/apiSchema';

export class RegisterUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(payload: RegisterPayload): ApiPromise<User> {
    return await this.authRepository.register(payload);
  }
}
