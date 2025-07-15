import { ForgotPasswordUseCase } from '@application/use-cases/auth/ForgotPasswordUseCase';
import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { ApiSuccessCodes } from '@domain/constants/successCodes';
import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { ForgotPasswordPayload } from '@domain/types/apiSchema';

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
      data: null,
      message: 'Password reset email sent',
      status: 200,
      code: ApiSuccessCodes.SUCCESS,
      timestamp: new Date().toISOString(),
      requestId: 'req_test_123',
    });

    const result = await forgotPasswordUseCase.execute(mockPayload);

    expect(mockAuthRepository.forgotPassword).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: true,
      data: null,
      message: 'Password reset email sent',
      status: 200,
      code: ApiSuccessCodes.SUCCESS,
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('should handle forgot password failure', async () => {
    const mockPayload: ForgotPasswordPayload = {
      email: 'nonexistent@example.com',
    };

    mockAuthRepository.forgotPassword.mockResolvedValue({
      success: false,
      data: null,
      message: 'Email not found',
      status: 404,
      code: ApiErrorCodes.RESOURCE_NOT_FOUND,
      timestamp: new Date().toISOString(),
      requestId: 'req_test_456',
    });

    const result = await forgotPasswordUseCase.execute(mockPayload);

    expect(mockAuthRepository.forgotPassword).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: null,
      message: 'Email not found',
      status: 404,
      code: ApiErrorCodes.RESOURCE_NOT_FOUND,
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });
});
