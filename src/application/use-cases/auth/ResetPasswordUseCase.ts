import { ApiPromise, ResetPasswordPayload } from '@/domain/types/apiSchema';
import { AuthRepository } from '@domain/repositories/AuthRepository';

export class ResetPasswordUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(payload: ResetPasswordPayload): ApiPromise<void> {
    return await this.authRepository.resetPassword(payload);
  }
}
