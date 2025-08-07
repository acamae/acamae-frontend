import { LogoutUseCase } from '@application/use-cases/auth/LogoutUseCase';
import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { ApiSuccessCodes } from '@domain/constants/successCodes';
import { IAuthRepository } from '@domain/repositories/AuthRepository';

describe('LogoutUseCase', () => {
  let logoutUseCase: LogoutUseCase;
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

    logoutUseCase = new LogoutUseCase(mockAuthRepository);
  });

  it('should call repository logout method', async () => {
    mockAuthRepository.logout.mockResolvedValue({
      success: true,
      data: null,
      status: 200,
      message: 'Logout successful',
      code: ApiSuccessCodes.SUCCESS,
      timestamp: new Date().toISOString(),
      requestId: 'req_logout_123',
    });

    const result = await logoutUseCase.execute();

    expect(mockAuthRepository.logout).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      data: null,
      status: expect.any(Number),
      message: 'Logout successful',
      code: ApiSuccessCodes.SUCCESS,
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('should handle logout failure', async () => {
    mockAuthRepository.logout.mockResolvedValue({
      success: false,
      data: null,
      status: 401,
      message: 'Logout failed',
      code: ApiErrorCodes.ERR_NETWORK,
      timestamp: new Date().toISOString(),
      requestId: 'req_logout_456',
    });

    const result = await logoutUseCase.execute();

    expect(mockAuthRepository.logout).toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      data: null,
      status: expect.any(Number),
      message: 'Logout failed',
      code: ApiErrorCodes.ERR_NETWORK,
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });
});
