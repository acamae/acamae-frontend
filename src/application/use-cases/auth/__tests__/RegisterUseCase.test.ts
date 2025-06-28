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
      status: 201,
      code: ApiSuccessCodes.SUCCESS,
    });

    const result = await registerUseCase.execute(mockPayload);

    expect(mockAuthRepository.register).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: true,
      data: null,
      message: 'User registered successfully',
      status: 201,
      code: ApiSuccessCodes.SUCCESS,
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
      status: 400,
      code: ApiErrorCodes.VALIDATION_FAILED,
    });

    const result = await registerUseCase.execute(mockPayload);

    expect(mockAuthRepository.register).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: null,
      message: 'Email already exists',
      status: 400,
      code: ApiErrorCodes.VALIDATION_FAILED,
    });
  });
});
