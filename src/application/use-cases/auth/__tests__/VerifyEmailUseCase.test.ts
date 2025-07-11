import { VerifyEmailUseCase } from '@application/use-cases/auth/VerifyEmailUseCase';
import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { ApiSuccessCodes } from '@domain/constants/successCodes';
import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { VerifyEmailPayload, EmailVerificationResponse } from '@domain/types/apiSchema';

describe('VerifyEmailUseCase', () => {
  let verifyEmailUseCase: VerifyEmailUseCase;
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
      resendVerification: jest.fn(),
      verifyEmail: jest.fn(),
    } as unknown as jest.Mocked<IAuthRepository>;

    verifyEmailUseCase = new VerifyEmailUseCase(mockAuthRepository);
  });

  it('should call repository verifyEmail method with correct payload', async () => {
    const mockPayload: VerifyEmailPayload = {
      token: 'valid-verification-token',
    };

    const mockResponse: EmailVerificationResponse = {
      status: ApiSuccessCodes.SUCCESS,
      message: 'Email verified successfully',
      resendRequired: false,
    };

    mockAuthRepository.verifyEmail.mockResolvedValue({
      success: true,
      data: mockResponse,
      message: 'Email verified successfully',
      status: 200,
      code: ApiSuccessCodes.SUCCESS,
    });

    const result = await verifyEmailUseCase.execute(mockPayload);

    expect(mockAuthRepository.verifyEmail).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: true,
      data: mockResponse,
      message: 'Email verified successfully',
      status: 200,
      code: ApiSuccessCodes.SUCCESS,
    });
  });

  it('should handle expired token verification', async () => {
    const mockPayload: VerifyEmailPayload = {
      token: 'expired-verification-token',
    };

    const mockResponse: EmailVerificationResponse = {
      status: ApiErrorCodes.AUTH_TOKEN_EXPIRED,
      message: 'Verification token has expired',
      resendRequired: true,
    };

    mockAuthRepository.verifyEmail.mockResolvedValue({
      success: false,
      data: mockResponse,
      message: 'Verification token has expired',
      status: 410,
      code: ApiErrorCodes.AUTH_TOKEN_EXPIRED,
    });

    const result = await verifyEmailUseCase.execute(mockPayload);

    expect(mockAuthRepository.verifyEmail).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: mockResponse,
      message: 'Verification token has expired',
      status: 410,
      code: ApiErrorCodes.AUTH_TOKEN_EXPIRED,
    });
  });

  it('should handle invalid token verification', async () => {
    const mockPayload: VerifyEmailPayload = {
      token: 'invalid-verification-token',
    };

    const mockResponse: EmailVerificationResponse = {
      status: ApiErrorCodes.AUTH_TOKEN_INVALID,
      message: 'Invalid verification token',
      resendRequired: true,
    };

    mockAuthRepository.verifyEmail.mockResolvedValue({
      success: false,
      data: mockResponse,
      message: 'Invalid verification token',
      status: 400,
      code: ApiErrorCodes.AUTH_TOKEN_INVALID,
    });

    const result = await verifyEmailUseCase.execute(mockPayload);

    expect(mockAuthRepository.verifyEmail).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: mockResponse,
      message: 'Invalid verification token',
      status: 400,
      code: ApiErrorCodes.AUTH_TOKEN_INVALID,
    });
  });

  it('should handle already verified email', async () => {
    const mockPayload: VerifyEmailPayload = {
      token: 'already-used-token',
    };

    const mockResponse: EmailVerificationResponse = {
      status: ApiErrorCodes.AUTH_USER_ALREADY_VERIFIED,
      message: 'Email is already verified',
      resendRequired: false,
    };

    mockAuthRepository.verifyEmail.mockResolvedValue({
      success: false,
      data: mockResponse,
      message: 'Email is already verified',
      status: 409,
      code: ApiErrorCodes.VALIDATION_ERROR,
    });

    const result = await verifyEmailUseCase.execute(mockPayload);

    expect(mockAuthRepository.verifyEmail).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: mockResponse,
      message: 'Email is already verified',
      status: 409,
      code: ApiErrorCodes.VALIDATION_ERROR,
    });
  });

  it('should handle update failed scenario', async () => {
    const mockPayload: VerifyEmailPayload = {
      token: 'valid-token-update-failed',
    };

    const mockResponse: EmailVerificationResponse = {
      status: ApiErrorCodes.AUTH_UPDATE_FAILED,
      message: 'Token is valid but user update failed',
      resendRequired: true,
    };

    mockAuthRepository.verifyEmail.mockResolvedValue({
      success: false,
      data: mockResponse,
      message: 'Token is valid but user update failed',
      status: 500,
      code: ApiErrorCodes.ERR_NETWORK,
    });

    const result = await verifyEmailUseCase.execute(mockPayload);

    expect(mockAuthRepository.verifyEmail).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: mockResponse,
      message: 'Token is valid but user update failed',
      status: 500,
      code: ApiErrorCodes.ERR_NETWORK,
    });
  });
});
