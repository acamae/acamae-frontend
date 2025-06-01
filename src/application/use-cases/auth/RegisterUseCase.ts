import { User } from '@/domain/entities/User';
import { ApiPromise, RegisterPayload } from '@/domain/types/apiSchema';
import { AuthRepository } from '@domain/repositories/AuthRepository';

export class RegisterUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(payload: RegisterPayload): ApiPromise<User> {
    return await this.authRepository.register(payload);
  }
}
