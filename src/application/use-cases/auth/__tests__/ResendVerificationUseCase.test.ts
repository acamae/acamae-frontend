import { ResendVerificationUseCase } from '@application/use-cases/auth/ResendVerificationUseCase';
import { IAuthRepository } from '@domain/repositories/auth/AuthRepository';
import { ResendVerificationPayload } from '@domain/types/apiSchema';

describe('ResendVerificationUseCase', () => {
  it('should delegate to authRepository.resendVerification', async () => {
    const repo = {
      resendVerification: jest.fn().mockResolvedValue({ success: true, data: undefined }),
    } as unknown as IAuthRepository;
    const uc = new ResendVerificationUseCase(repo);
    const payload: ResendVerificationPayload = { identifier: 'test@example.com' };
    const res = await uc.execute(payload);
    expect(repo.resendVerification).toHaveBeenCalledWith(payload);
    expect(res.success).toBe(true);
  });
});
