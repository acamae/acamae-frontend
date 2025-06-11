import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { ApiResponse, ResendVerificationPayload } from '@domain/types/apiSchema';

export class ResendVerificationUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(payload: ResendVerificationPayload): Promise<ApiResponse<void>> {
    return await this.authRepository.resendVerification(payload);
  }
}
