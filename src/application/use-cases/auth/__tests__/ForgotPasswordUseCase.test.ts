import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { ForgotPasswordPayload } from '@domain/types/apiSchema';

import { ForgotPasswordUseCase } from '../ForgotPasswordUseCase';

describe('ForgotPasswordUseCase', () => {
  let forgotPasswordUseCase: ForgotPasswordUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;

  beforeEach(() => {
    mockAuthRepository = {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      getCurrentUser: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IAuthRepository>;

    forgotPasswordUseCase = new ForgotPasswordUseCase(mockAuthRepository);
  });

  it('should call repository forgotPassword method with correct payload', async () => {
    const mockPayload: ForgotPasswordPayload = {
      email: 'test@example.com',
    };

    mockAuthRepository.forgotPassword.mockResolvedValue({
      success: true,
      message: 'Password reset email sent',
      status: 200,
      code: 'SUCCESS',
    });

    const result = await forgotPasswordUseCase.execute(mockPayload);

    expect(mockAuthRepository.forgotPassword).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: true,
      message: 'Password reset email sent',
      status: 200,
      code: 'SUCCESS',
    });
  });

  it('should handle forgot password failure', async () => {
    const mockPayload: ForgotPasswordPayload = {
      email: 'nonexistent@example.com',
    };

    mockAuthRepository.forgotPassword.mockResolvedValue({
      success: false,
      message: 'Email not found',
      status: 404,
      code: 'NOT_FOUND',
    });

    const result = await forgotPasswordUseCase.execute(mockPayload);

    expect(mockAuthRepository.forgotPassword).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      message: 'Email not found',
      status: 404,
      code: 'NOT_FOUND',
    });
  });
});
