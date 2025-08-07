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
      status: 200,
      message: 'Email verified successfully',
      code: ApiSuccessCodes.SUCCESS,
      timestamp: new Date().toISOString(),
      requestId: 'req_verify_123',
    });

    const result = await verifyEmailUseCase.execute(mockPayload);

    expect(mockAuthRepository.verifyEmail).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: true,
      data: mockResponse,
      status: expect.any(Number),
      message: 'Email verified successfully',
      code: ApiSuccessCodes.SUCCESS,
      timestamp: expect.any(String),
      requestId: expect.any(String),
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
      status: 401,
      message: 'Verification token has expired',
      code: ApiErrorCodes.AUTH_TOKEN_EXPIRED,
      timestamp: new Date().toISOString(),
      requestId: 'req_verify_456',
    });

    const result = await verifyEmailUseCase.execute(mockPayload);

    expect(mockAuthRepository.verifyEmail).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: mockResponse,
      status: expect.any(Number),
      message: 'Verification token has expired',
      code: ApiErrorCodes.AUTH_TOKEN_EXPIRED,
      timestamp: expect.any(String),
      requestId: expect.any(String),
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
      status: 401,
      message: 'Invalid verification token',
      code: ApiErrorCodes.AUTH_TOKEN_INVALID,
      timestamp: new Date().toISOString(),
      requestId: 'req_verify_789',
    });

    const result = await verifyEmailUseCase.execute(mockPayload);

    expect(mockAuthRepository.verifyEmail).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: mockResponse,
      status: expect.any(Number),
      message: 'Invalid verification token',
      code: ApiErrorCodes.AUTH_TOKEN_INVALID,
      timestamp: expect.any(String),
      requestId: expect.any(String),
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
      status: 400,
      message: 'Email is already verified',
      code: ApiErrorCodes.VALIDATION_ERROR,
      timestamp: new Date().toISOString(),
      requestId: 'req_verify_abc',
    });

    const result = await verifyEmailUseCase.execute(mockPayload);

    expect(mockAuthRepository.verifyEmail).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: mockResponse,
      status: expect.any(Number),
      message: 'Email is already verified',
      code: ApiErrorCodes.VALIDATION_ERROR,
      timestamp: expect.any(String),
      requestId: expect.any(String),
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
      status: 0,
      message: 'Token is valid but user update failed',
      code: ApiErrorCodes.ERR_NETWORK,
      timestamp: new Date().toISOString(),
      requestId: 'req_verify_def',
    });

    const result = await verifyEmailUseCase.execute(mockPayload);

    expect(mockAuthRepository.verifyEmail).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: mockResponse,
      status: expect.any(Number),
      message: 'Token is valid but user update failed',
      code: ApiErrorCodes.ERR_NETWORK,
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });
});
