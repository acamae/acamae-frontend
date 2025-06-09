import {
  loginAction,
  logoutAction,
  registerAction,
  forgotPasswordAction,
  resetPasswordAction,
} from '@application/state/actions/auth.actions';
import reducer, { initialAuthState } from '@application/state/slices/authSlice';
import { USER_ROLES } from '@domain/constants/user';

interface ActionCreator {
  pending: { type: string };
  fulfilled: { type: string };
  rejected: { type: string };
}

describe('authSlice reducer', () => {
  const user = {
    id: '1',
    email: 'a@b.com',
    username: 'alice',
    role: USER_ROLES.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it.each([
    ['login', loginAction],
    ['register', registerAction],
  ])('%s pending => loading true', (_name, actionCreator: ActionCreator) => {
    const state = reducer(initialAuthState, { type: actionCreator.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it.each([
    ['login', loginAction],
    ['register', registerAction],
  ])('%s fulfilled => isAuthenticated true y user set', (_n, actionCreator: ActionCreator) => {
    const state = reducer(initialAuthState, {
      type: actionCreator.fulfilled.type,
      payload: { data: user },
    });
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('a@b.com');
  });

  it('login fulfilled with undefined data => sets user to null', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.fulfilled.type,
      payload: { data: undefined },
    });
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).not.toBeNull();
    expect(state.user).toBeNull();
  });

  it('login fulfilled with null data => sets user to null', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.fulfilled.type,
      payload: { data: null },
    });
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).not.toBeNull();
    expect(state.user).toBeNull();
  });

  it('login fulfilled with missing data => sets user to null', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.fulfilled.type,
      payload: {},
    });
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).not.toBeNull();
    expect(state.user).toBeNull();
  });

  it('login rejected => error set', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.rejected.type,
      error: { message: 'fail' },
    });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('fail');
  });

  it('logout fulfilled => limpia estado', () => {
    const authState = { ...initialAuthState, isAuthenticated: true, user };
    const state = reducer(authState, { type: logoutAction.fulfilled.type });
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('forgotPassword fulfilled => loading false', () => {
    const state = reducer(
      { ...initialAuthState, loading: true },
      {
        type: forgotPasswordAction.fulfilled.type,
      }
    );
    expect(state.loading).toBe(false);
  });

  it('resetPassword rejected => error set', () => {
    const state = reducer(initialAuthState, {
      type: resetPasswordAction.rejected.type,
      error: { message: 'oops' },
    });
    expect(state.error).toBe('oops');
  });

  it('logout pending marca loading', () => {
    const state = reducer(initialAuthState, { type: logoutAction.pending.type });
    expect(state.loading).toBe(true);
  });

  it('logout rejected setea error', () => {
    const state = reducer(initialAuthState, {
      type: logoutAction.rejected.type,
      error: { message: 'err' },
    });
    expect(state.error).toBe('err');
  });

  it.each([
    ['forgot pending', forgotPasswordAction.pending.type],
    ['reset pending', resetPasswordAction.pending.type],
  ])('%s => loading true', (_title, type) => {
    const state = reducer(initialAuthState, { type });
    expect(state.loading).toBe(true);
  });

  it('resetPassword fulfilled marca loading false', () => {
    const state = reducer(
      { ...initialAuthState, loading: true },
      {
        type: resetPasswordAction.fulfilled.type,
      }
    );
    expect(state.loading).toBe(false);
  });

  it('register rejected => error set', () => {
    const state = reducer(initialAuthState, {
      type: registerAction.rejected.type,
      error: { message: 'Error de registro' },
    });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Error de registro');
  });

  it('register rejected with undefined error message => error set to null', () => {
    const state = reducer(initialAuthState, {
      type: registerAction.rejected.type,
      error: { message: undefined },
    });
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('login rejected with undefined error message => error set to null', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.rejected.type,
      error: { message: undefined },
    });
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('logout rejected with undefined error message => error set to null', () => {
    const state = reducer(initialAuthState, {
      type: logoutAction.rejected.type,
      error: { message: undefined },
    });
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('forgotPassword rejected => error set', () => {
    const state = reducer(initialAuthState, {
      type: forgotPasswordAction.rejected.type,
      error: { message: 'Error en recuperación' },
    });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Error en recuperación');
  });

  it('forgotPassword rejected with undefined error message => error set to null', () => {
    const state = reducer(initialAuthState, {
      type: forgotPasswordAction.rejected.type,
      error: { message: undefined },
    });
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('login fulfilled with undefined payload => sets user to null', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.fulfilled.type,
      payload: undefined,
    });
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).not.toBeNull();
    expect(state.user).toBeNull();
  });

  it('register fulfilled with undefined payload => sets user to null', () => {
    const state = reducer(initialAuthState, {
      type: registerAction.fulfilled.type,
      payload: undefined,
    });
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).not.toBeNull();
    expect(state.user).toBeNull();
  });

  it('register fulfilled with undefined data => sets user to null', () => {
    const state = reducer(initialAuthState, {
      type: registerAction.fulfilled.type,
      payload: { data: undefined },
    });
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).not.toBeNull();
    expect(state.user).toBeNull();
  });
});
