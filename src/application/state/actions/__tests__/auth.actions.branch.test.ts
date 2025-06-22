import {
  loginAction,
  registerAction,
  forgotPasswordAction,
  resetPasswordAction,
  logoutAction,
  resendVerificationAction,
} from '@application/state/actions/auth.actions';

const dispatch = jest.fn();
const getState = jest.fn();

interface Extra {
  [key: string]: {
    execute: jest.Mock;
  };
}

interface Case {
  name: string;
  action: unknown;
  key: string;
  payload: unknown;
}

const successResult = { success: true, data: { ok: true } };
const failureResult = { success: false, message: 'fail', data: null };

const cases: Case[] = [
  {
    name: 'login',
    action: loginAction,
    key: 'loginUseCase',
    payload: { email: 'a', password: 'b' },
  },
  {
    name: 'register',
    action: registerAction,
    key: 'registerUseCase',
    payload: { email: 'a', password: 'b', username: 'u' },
  },
  {
    name: 'forgotPassword',
    action: forgotPasswordAction,
    key: 'forgotPasswordUseCase',
    payload: { email: 'a' },
  },
  {
    name: 'resetPassword',
    action: resetPasswordAction,
    key: 'resetPasswordUseCase',
    payload: { token: 't', password: 'p' },
  },
  { name: 'logout', action: logoutAction, key: 'logoutUseCase', payload: undefined },
  {
    name: 'resendVerification',
    action: resendVerificationAction,
    key: 'resendVerificationUseCase',
    payload: { identifier: 'a' },
  },
];

describe('auth.actions branches', () => {
  it.each(cases)('should create fulfilled action for %s (success=true)', async c => {
    const execute = jest.fn().mockResolvedValue(successResult);
    const extra: Extra = { [c.key]: { execute } };
    // @ts-ignore dynamic payload type
    const result = await c.action(c.payload)(dispatch, getState, extra);
    if (typeof c.payload === 'undefined') {
      expect(execute).toHaveBeenCalledWith();
    } else {
      expect(execute).toHaveBeenCalledWith(c.payload);
    }
    expect(result.type).toContain('fulfilled');
    expect(result.payload).toEqual(successResult);
  });

  it.each(cases)('should create rejected action for %s (success=false)', async c => {
    const execute = jest.fn().mockResolvedValue(failureResult);
    const extra: Extra = { [c.key]: { execute } };
    // @ts-ignore
    const result = await c.action(c.payload)(dispatch, getState, extra);
    if (typeof c.payload === 'undefined') {
      expect(execute).toHaveBeenCalledWith();
    } else {
      expect(execute).toHaveBeenCalledWith(c.payload);
    }
    expect(result.type).toContain('rejected');
    expect(result.payload).toEqual(failureResult);
  });

  it.each(cases)('should create rejected action for %s when execute throws', async c => {
    const thrown = new Error('boom');
    const execute = jest.fn().mockRejectedValue(thrown);
    const extra: Extra = { [c.key]: { execute } };
    // @ts-ignore
    const result = await c.action(c.payload)(dispatch, getState, extra);
    if (typeof c.payload === 'undefined') {
      expect(execute).toHaveBeenCalledWith();
    } else {
      expect(execute).toHaveBeenCalledWith(c.payload);
    }
    expect(result.type).toContain('rejected');
    expect(result.payload).toEqual(thrown);
  });
});
