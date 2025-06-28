import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { IAuthRepository } from '@domain/repositories/AuthRepository';

import { VerifyEmailUseCase } from '../VerifyEmailUseCase';

describe('VerifyEmailUseCase', () => {
  let mockAuthRepository: jest.Mocked<IAuthRepository>;
  let useCase: VerifyEmailUseCase;

  beforeEach(() => {
    mockAuthRepository = {
      verifyEmail: jest.fn(),
    } as unknown as jest.Mocked<IAuthRepository>;
    useCase = new VerifyEmailUseCase(mockAuthRepository);
  });

  it('debe devolver éxito si el token es válido', async () => {
    mockAuthRepository.verifyEmail.mockResolvedValue({
      success: true,
      data: null,
      status: 200,
      code: 'SUCCESS',
    });
    const result = await useCase.execute('tokenvalido');
    expect(mockAuthRepository.verifyEmail).toHaveBeenCalledWith('tokenvalido');
    expect(result.success).toBe(true);
  });

  it('debe devolver error si el token es inválido', async () => {
    mockAuthRepository.verifyEmail.mockResolvedValue({
      success: false,
      data: null,
      status: 400,
      code: ApiErrorCodes.AUTH_TOKEN_INVALID,
      message: 'Token inválido',
    });
    const result = await useCase.execute('tokeninvalido');
    expect(mockAuthRepository.verifyEmail).toHaveBeenCalledWith('tokeninvalido');
    expect(result.success).toBe(false);
    expect(result.code).toBe(ApiErrorCodes.AUTH_TOKEN_INVALID);
  });
});
