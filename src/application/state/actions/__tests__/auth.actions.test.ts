import {
  loginAction,
  registerAction,
  forgotPasswordAction,
} from '@application/state/actions/auth.actions';

const dispatch = jest.fn();
const getState = jest.fn();

interface ThunkPayload {
  email: string;
  password: string;
  username?: string;
}

interface ThunkExtra {
  [key: string]: {
    execute: jest.Mock;
  };
}

interface ThunkCreator {
  (
    payload: ThunkPayload
  ): (dispatch: jest.Mock, getState: jest.Mock, extra: ThunkExtra) => Promise<unknown>;
  pending: { type: string };
  fulfilled: { type: string };
  rejected: { type: string };
}

function isThunkCreator(value: unknown): value is ThunkCreator {
  return (
    typeof value === 'function' && 'pending' in value && 'fulfilled' in value && 'rejected' in value
  );
}

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
      if (!isThunkCreator(thunkCreator)) {
        throw new Error('Invalid thunk creator');
      }
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

  it.each([
    ['login', loginAction],
    ['register', registerAction],
  ])('%s action creator', (_name, thunkCreator: unknown) => {
    if (!isThunkCreator(thunkCreator)) {
      throw new Error('Invalid thunk creator');
    }
    expect(thunkCreator.pending.type).toBeDefined();
    expect(thunkCreator.fulfilled.type).toBeDefined();
    expect(thunkCreator.rejected.type).toBeDefined();
  });
});
