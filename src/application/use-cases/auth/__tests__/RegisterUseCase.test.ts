import { USER_ROLES } from '@domain/constants/user';
import { User } from '@domain/entities/User';
import { IAuthRepository } from '@domain/repositories/AuthRepository';
import { RegisterPayload } from '@domain/types/apiSchema';

import { RegisterUseCase } from '../RegisterUseCase';

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

    const mockUser: User = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: USER_ROLES.USER,
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockAuthRepository.register.mockResolvedValue({
      success: true,
      data: mockUser,
      message: 'Registration successful',
      status: 201,
      code: 'CREATED',
    });

    const result = await registerUseCase.execute(mockPayload);

    expect(mockAuthRepository.register).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: true,
      data: mockUser,
      message: 'Registration successful',
      status: 201,
      code: 'CREATED',
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
      data: undefined,
      message: 'Email already exists',
      status: 400,
      code: 'BAD_REQUEST',
    });

    const result = await registerUseCase.execute(mockPayload);

    expect(mockAuthRepository.register).toHaveBeenCalledWith(mockPayload);
    expect(result).toEqual({
      success: false,
      data: undefined,
      message: 'Email already exists',
      status: 400,
      code: 'BAD_REQUEST',
    });
  });
});
