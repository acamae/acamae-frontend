import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { ResetPasswordPayload } from '@domain/types/apiSchema';

import { ResetPasswordUseCase } from '../ResetPasswordUseCase';

describe('ResetPasswordUseCase', () => {
  let resetPasswordUseCase: ResetPasswordUseCase;
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

    resetPasswordUseCase = new ResetPasswordUseCase(mockAuthRepository);
  });

  it('should call repository resetPassword method with correct payload', async () => {
    const mockPayload: ResetPasswordPayload = {
      token: 'valid-reset-token',
      newPassword: 'newPassword123',
    };

    mockAuthRepository.resetPassword.mockResolvedValue({
      success: true,
      message: 'Password reset successful',
      status: 200,
      code: 'SUCCESS',
    });

    const result = await resetPasswordUseCase.execute(mockPayload);

    expect(mockAuthRepository.resetPassword).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: true,
      message: 'Password reset successful',
      status: 200,
      code: 'SUCCESS',
    });
  });

  it('should handle reset password failure with invalid token', async () => {
    const mockPayload: ResetPasswordPayload = {
      token: 'invalid-reset-token',
      newPassword: 'newPassword123',
    };

    mockAuthRepository.resetPassword.mockResolvedValue({
      success: false,
      message: 'Invalid or expired reset token',
      status: 400,
      code: 'BAD_REQUEST',
    });

    const result = await resetPasswordUseCase.execute(mockPayload);

    expect(mockAuthRepository.resetPassword).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      message: 'Invalid or expired reset token',
      status: 400,
      code: 'BAD_REQUEST',
    });
  });

  it('should handle reset password failure with expired token', async () => {
    const mockPayload: ResetPasswordPayload = {
      token: 'expired-reset-token',
      newPassword: 'newPassword123',
    };

    mockAuthRepository.resetPassword.mockResolvedValue({
      success: false,
      message: 'Reset token has expired',
      status: 410,
      code: 'GONE',
    });

    const result = await resetPasswordUseCase.execute(mockPayload);

    expect(mockAuthRepository.resetPassword).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      message: 'Reset token has expired',
      status: 410,
      code: 'GONE',
    });
  });
});
