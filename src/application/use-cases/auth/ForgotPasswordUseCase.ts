import { ForgotPasswordPayload, ApiPromise } from '@/domain/types/apiSchema';
import { AuthRepository } from '@domain/repositories/AuthRepository';

export class ForgotPasswordUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(payload: ForgotPasswordPayload): ApiPromise<void> {
    return await this.authRepository.forgotPassword(payload);
  }
}
