import { RegisterUseCase } from '@application/use-cases/auth/RegisterUseCase';
import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { ApiSuccessCodes } from '@domain/constants/successCodes';
import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { RegisterPayload } from '@domain/types/apiSchema';

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
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

    registerUseCase = new RegisterUseCase(mockAuthRepository);
  });

  it('should call repository register method with correct payload', async () => {
    const mockPayload: RegisterPayload = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    mockAuthRepository.register.mockResolvedValue({
      success: true,
      data: null,
      message: 'User registered successfully',
      code: ApiSuccessCodes.SUCCESS,
      timestamp: new Date().toISOString(),
      requestId: 'req_register_123',
    });

    const result = await registerUseCase.execute(mockPayload);

    expect(mockAuthRepository.register).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: true,
      data: null,
      message: 'User registered successfully',
      code: ApiSuccessCodes.SUCCESS,
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('should handle registration failure', async () => {
    const mockPayload: RegisterPayload = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    mockAuthRepository.register.mockResolvedValue({
      success: false,
      data: null,
      message: 'Email already exists',
      code: ApiErrorCodes.VALIDATION_ERROR,
      timestamp: new Date().toISOString(),
      requestId: 'req_register_456',
    });

    const result = await registerUseCase.execute(mockPayload);

    expect(mockAuthRepository.register).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: null,
      message: 'Email already exists',
      code: ApiErrorCodes.VALIDATION_ERROR,
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('should handle DATABASE_ERROR during registration', async () => {
    const mockPayload: RegisterPayload = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    mockAuthRepository.register.mockResolvedValue({
      success: false,
      data: null,
      message: 'Database error occurred during registration',
      code: ApiErrorCodes.DATABASE_ERROR,
      timestamp: new Date().toISOString(),
      requestId: 'req_register_789',
    });

    const result = await registerUseCase.execute(mockPayload);

    expect(mockAuthRepository.register).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: null,
      message: 'Database error occurred during registration',
      code: ApiErrorCodes.DATABASE_ERROR,
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('should handle EMAIL_NOT_VERIFIED error during registration', async () => {
    const mockPayload: RegisterPayload = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    mockAuthRepository.register.mockResolvedValue({
      success: false,
      data: null,
      message: 'Email verification required',
      code: ApiErrorCodes.EMAIL_NOT_VERIFIED,
      timestamp: new Date().toISOString(),
      requestId: 'req_register_abc',
    });

    const result = await registerUseCase.execute(mockPayload);

    expect(mockAuthRepository.register).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: null,
      message: 'Email verification required',
      code: ApiErrorCodes.EMAIL_NOT_VERIFIED,
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('should handle multiple error codes in registration', async () => {
    const mockPayload: RegisterPayload = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    const errorCodes = [
      ApiErrorCodes.DATABASE_ERROR,
      ApiErrorCodes.EMAIL_NOT_VERIFIED,
      ApiErrorCodes.INVALID_REFRESH_TOKEN,
    ];

    for (const code of errorCodes) {
      mockAuthRepository.register.mockResolvedValue({
        success: false,
        data: null,
        message: `Registration error: ${code}`,
        code,
        timestamp: new Date().toISOString(),
        requestId: `req_register_${code}`,
      });

      const result = await registerUseCase.execute(mockPayload);

      expect(mockAuthRepository.register).toHaveBeenCalledWith(mockPayload);
      expect(result.code).toBe(code);
      expect(result.timestamp).toBeDefined();
      expect(result.requestId).toBeDefined();
    }
  });
});
