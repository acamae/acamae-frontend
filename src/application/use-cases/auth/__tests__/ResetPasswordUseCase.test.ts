import { ResetPasswordUseCase } from '@application/use-cases/auth/ResetPasswordUseCase';
import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { ApiSuccessCodes } from '@domain/constants/successCodes';
import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { ResetPasswordPayload } from '@domain/types/apiSchema';

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
      password: 'newPassword123',
    };

    mockAuthRepository.resetPassword.mockResolvedValue({
      success: true,
      data: null,
      message: 'Password reset successful',
      status: 200,
      code: ApiSuccessCodes.SUCCESS,
    });

    const result = await resetPasswordUseCase.execute(mockPayload);

    expect(mockAuthRepository.resetPassword).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: true,
      data: null,
      message: 'Password reset successful',
      status: 200,
      code: ApiSuccessCodes.SUCCESS,
    });
  });

  it('should handle reset password failure with invalid token', async () => {
    const mockPayload: ResetPasswordPayload = {
      token: 'invalid-reset-token',
      password: 'newPassword123',
    };

    mockAuthRepository.resetPassword.mockResolvedValue({
      success: false,
      data: null,
      message: 'Invalid or expired reset token',
      status: 400,
      code: ApiErrorCodes.AUTH_TOKEN_INVALID,
    });

    const result = await resetPasswordUseCase.execute(mockPayload);

    expect(mockAuthRepository.resetPassword).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: null,
      message: 'Invalid or expired reset token',
      status: 400,
      code: ApiErrorCodes.AUTH_TOKEN_INVALID,
    });
  });

  it('should handle reset password failure with expired token', async () => {
    const mockPayload: ResetPasswordPayload = {
      token: 'expired-reset-token',
      password: 'newPassword123',
    };

    mockAuthRepository.resetPassword.mockResolvedValue({
      success: false,
      data: null,
      message: 'Reset token has expired',
      status: 410,
      code: ApiErrorCodes.AUTH_TOKEN_EXPIRED,
    });

    const result = await resetPasswordUseCase.execute(mockPayload);

    expect(mockAuthRepository.resetPassword).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: null,
      message: 'Reset token has expired',
      status: 410,
      code: ApiErrorCodes.AUTH_TOKEN_EXPIRED,
    });
  });
});
