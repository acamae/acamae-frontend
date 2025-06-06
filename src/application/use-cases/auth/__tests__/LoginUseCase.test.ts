import { USER_ROLES } from '@domain/constants/user';
import { User } from '@domain/entities/User';
import { AuthRepository } from '@domain/repositories/AuthRepository';
import { LoginPayload } from '@domain/types/apiSchema';

import { LoginUseCase } from '../LoginUseCase';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockAuthRepository: jest.Mocked<AuthRepository>;

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
    } as unknown as jest.Mocked<AuthRepository>;

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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockAuthRepository.login.mockResolvedValue({
      success: true,
      data: mockUser,
      message: 'Login successful',
      status: 200,
      code: 'SUCCESS',
    });

    const result = await loginUseCase.execute(mockPayload);

    expect(mockAuthRepository.login).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: true,
      data: mockUser,
      message: 'Login successful',
      status: 200,
      code: 'SUCCESS',
    });
  });

  it('should handle login failure', async () => {
    const mockPayload: LoginPayload = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    mockAuthRepository.login.mockResolvedValue({
      success: false,
      data: undefined,
      message: 'Invalid credentials',
      status: 401,
      code: 'UNAUTHORIZED',
    });

    const result = await loginUseCase.execute(mockPayload);

    expect(mockAuthRepository.login).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: undefined,
      message: 'Invalid credentials',
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });
});
