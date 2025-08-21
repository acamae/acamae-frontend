import { IAuthRepository } from '@domain/repositories/auth/AuthRepository';
import {
  ApiPromise,
  ResetTokenValidationResponse,
  ValidateResetTokenPayload,
} from '@domain/types/apiSchema';

export class ValidateResetTokenUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(payload: ValidateResetTokenPayload): ApiPromise<ResetTokenValidationResponse> {
    return await this.authRepository.validateResetToken(payload);
  }
}
