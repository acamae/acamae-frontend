import { AuthRepository } from '@domain/repositories/AuthRepository';

import { LogoutUseCase } from '../LogoutUseCase';

describe('LogoutUseCase', () => {
  let logoutUseCase: LogoutUseCase;
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

    logoutUseCase = new LogoutUseCase(mockAuthRepository);
  });

  it('should call repository logout method', async () => {
    mockAuthRepository.logout.mockResolvedValue({
      success: true,
      message: 'Logout successful',
      status: 200,
      code: 'SUCCESS',
    });

    const result = await logoutUseCase.execute();

    expect(mockAuthRepository.logout).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      message: 'Logout successful',
      status: 200,
      code: 'SUCCESS',
    });
  });

  it('should handle logout failure', async () => {
    mockAuthRepository.logout.mockResolvedValue({
      success: false,
      message: 'Logout failed',
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
    });

    const result = await logoutUseCase.execute();

    expect(mockAuthRepository.logout).toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      message: 'Logout failed',
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
    });
  });
});
