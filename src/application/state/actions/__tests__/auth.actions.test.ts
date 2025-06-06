import {
  loginAction,
  registerAction,
  forgotPasswordAction,
} from '@application/state/actions/auth.actions';

const dispatch = jest.fn();
const getState = jest.fn();

describe('auth.actions thunks', () => {
  it.each([
    ['login', loginAction, 'loginUseCase', { email: 'a@b.com', password: '123' }],
    [
      'register',
      registerAction,
      'registerUseCase',
      { email: 'c@d.com', password: 'pwd', username: 'u' },
    ],
  ])(
    '%sAction ejecuta UseCase correspondiente',
    async (_n, thunkCreator: unknown, key: string, payload) => {
      const execute = jest.fn().mockResolvedValue({ data: null, success: true });
      await thunkCreator(payload)(dispatch, getState, { [key]: { execute } });
      expect(execute).toHaveBeenCalledWith(payload);
    }
  );

  it('forgotPasswordAction maneja error', async () => {
    const execute = jest.fn().mockRejectedValue(new Error('fail'));
    const result = await forgotPasswordAction({ email: 'x@y.com' })(dispatch, getState, {
      forgotPasswordUseCase: { execute },
    });
    expect(execute).toHaveBeenCalled();
    expect(result.type).toContain('rejected');
  });
});
