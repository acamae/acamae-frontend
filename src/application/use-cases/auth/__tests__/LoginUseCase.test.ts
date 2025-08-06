import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { ApiSuccessCodes } from '@domain/constants/successCodes';
import { USER_ROLES } from '@domain/constants/user';
import { User } from '@domain/entities/User';
import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { LoginPayload } from '@domain/types/apiSchema';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
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

    loginUseCase = new LoginUseCase(mockAuthRepository);
  });

  it('should call repository login method with correct payload', async () => {
    const mockPayload: LoginPayload = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser: User = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: USER_ROLES.USER,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    };

    mockAuthRepository.login.mockResolvedValue({
      success: true,
      data: mockUser,
      message: 'Login successful',
      code: ApiSuccessCodes.SUCCESS,
      timestamp: new Date().toISOString(),
      requestId: 'req_login_123',
    });

    const result = await loginUseCase.execute(mockPayload);

    expect(mockAuthRepository.login).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: true,
      data: mockUser,
      message: 'Login successful',
      code: ApiSuccessCodes.SUCCESS,
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('should handle login failure', async () => {
    const mockPayload: LoginPayload = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    mockAuthRepository.login.mockResolvedValue({
      success: false,
      data: null,
      message: 'Invalid credentials',
      code: ApiErrorCodes.AUTH_INVALID_CREDENTIALS,
      timestamp: new Date().toISOString(),
      requestId: 'req_login_456',
    });

    const result = await loginUseCase.execute(mockPayload);

    expect(mockAuthRepository.login).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: null,
      message: 'Invalid credentials',
      code: ApiErrorCodes.AUTH_INVALID_CREDENTIALS,
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('should handle INVALID_REFRESH_TOKEN error', async () => {
    const mockPayload: LoginPayload = {
      email: 'test@example.com',
      password: 'password123',
    };

    mockAuthRepository.login.mockResolvedValue({
      success: false,
      data: null,
      message: 'Invalid refresh token',
      code: ApiErrorCodes.INVALID_REFRESH_TOKEN,
      timestamp: new Date().toISOString(),
      requestId: 'req_login_789',
    });

    const result = await loginUseCase.execute(mockPayload);

    expect(mockAuthRepository.login).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: null,
      message: 'Invalid refresh token',
      code: ApiErrorCodes.INVALID_REFRESH_TOKEN,
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('should handle EMAIL_NOT_VERIFIED error', async () => {
    const mockPayload: LoginPayload = {
      email: 'test@example.com',
      password: 'password123',
    };

    mockAuthRepository.login.mockResolvedValue({
      success: false,
      data: null,
      message: 'Email not verified',
      code: ApiErrorCodes.EMAIL_NOT_VERIFIED,
      timestamp: new Date().toISOString(),
      requestId: 'req_login_abc',
    });

    const result = await loginUseCase.execute(mockPayload);

    expect(mockAuthRepository.login).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: null,
      message: 'Email not verified',
      code: ApiErrorCodes.EMAIL_NOT_VERIFIED,
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('should handle DATABASE_ERROR', async () => {
    const mockPayload: LoginPayload = {
      email: 'test@example.com',
      password: 'password123',
    };

    mockAuthRepository.login.mockResolvedValue({
      success: false,
      data: null,
      message: 'Database error occurred',
      code: ApiErrorCodes.DATABASE_ERROR,
      timestamp: new Date().toISOString(),
      requestId: 'req_login_def',
    });

    const result = await loginUseCase.execute(mockPayload);

    expect(mockAuthRepository.login).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: null,
      message: 'Database error occurred',
      code: ApiErrorCodes.DATABASE_ERROR,
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('should handle multiple error codes in sequence', async () => {
    const mockPayload: LoginPayload = {
      email: 'test@example.com',
      password: 'password123',
    };

    const errorCodes = [
      ApiErrorCodes.INVALID_REFRESH_TOKEN,
      ApiErrorCodes.EMAIL_NOT_VERIFIED,
      ApiErrorCodes.DATABASE_ERROR,
    ];

    for (const code of errorCodes) {
      mockAuthRepository.login.mockResolvedValue({
        success: false,
        data: null,
        message: `Error with code: ${code}`,
        code,
        timestamp: new Date().toISOString(),
        requestId: `req_login_${code}`,
      });

      const result = await loginUseCase.execute(mockPayload);

      expect(mockAuthRepository.login).toHaveBeenCalledWith(mockPayload);
      expect(result.code).toBe(code);
      expect(result.timestamp).toBeDefined();
      expect(result.requestId).toBeDefined();
    }
  });
});
