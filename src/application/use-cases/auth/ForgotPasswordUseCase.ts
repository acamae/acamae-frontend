import { IAuthRepository } from '@domain/repositories/auth/AuthRepository';
import { ForgotPasswordPayload, ApiPromise } from '@domain/types/apiSchema';

export class ForgotPasswordUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(payload: ForgotPasswordPayload): ApiPromise<void> {
    return await this.authRepository.forgotPassword(payload);
  }
}
