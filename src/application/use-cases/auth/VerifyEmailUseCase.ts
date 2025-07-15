import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { ApiPromise, EmailVerificationResponse, VerifyEmailPayload } from '@domain/types/apiSchema';

export class VerifyEmailUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(payload: VerifyEmailPayload): ApiPromise<EmailVerificationResponse> {
    console.log('VerifyEmailUseCase payload', payload);
    return await this.authRepository.verifyEmail(payload);
  }
}
