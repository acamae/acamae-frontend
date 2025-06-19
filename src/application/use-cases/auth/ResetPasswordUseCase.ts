import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { ApiPromise, ResetPasswordPayload } from '@domain/types/apiSchema';

export class ResetPasswordUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(payload: ResetPasswordPayload): ApiPromise<void> {
    return await this.authRepository.resetPassword(payload);
  }
}
