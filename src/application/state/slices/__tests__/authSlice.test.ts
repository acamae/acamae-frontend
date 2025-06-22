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
    ['forgotPassword', forgotPasswordAction],
    ['resetPassword', resetPasswordAction],
    ['logout', logoutAction],
  ])('should set loading to true when %s is pending', (_name, actionCreator: ActionCreator) => {
    const state = reducer(initialAuthState, { type: actionCreator.pending.type });
    expect(state.loading).toBe(true);
  });

  it.each([['login', loginAction]])(
    'should set isAuthenticated to true and user when %s is fulfilled',
    (_n, actionCreator: ActionCreator) => {
      const state = reducer(initialAuthState, {
        type: actionCreator.fulfilled.type,
        payload: { data: user },
      });
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('a@b.com');
    }
  );

  it('should set user to null when login is fulfilled with undefined data', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.fulfilled.type,
      payload: { data: undefined },
    });
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('should set user to null when login is fulfilled with null data', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.fulfilled.type,
      payload: { data: null },
    });
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('should set user to null when login is fulfilled with missing data', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.fulfilled.type,
      payload: {},
    });
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('should clear state when logout is fulfilled', () => {
    const authState = { ...initialAuthState, isAuthenticated: true, user };
    const state = reducer(authState, { type: logoutAction.fulfilled.type });
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('should set loading to false when forgotPassword is fulfilled', () => {
    const state = reducer(
      { ...initialAuthState, loading: true },
      {
        type: forgotPasswordAction.fulfilled.type,
      }
    );
    expect(state.loading).toBe(false);
  });

  it('should set loading to true when logout is pending', () => {
    const state = reducer(initialAuthState, { type: logoutAction.pending.type });
    expect(state.loading).toBe(true);
  });

  it.each([
    ['forgot pending', forgotPasswordAction.pending.type],
    ['reset pending', resetPasswordAction.pending.type],
  ])('should set loading to true when %s is pending', (_title, type) => {
    const state = reducer(initialAuthState, { type });
    expect(state.loading).toBe(true);
  });

  it('should set loading to false when resetPassword is fulfilled', () => {
    const state = reducer(
      { ...initialAuthState, loading: true },
      {
        type: resetPasswordAction.fulfilled.type,
      }
    );
    expect(state.loading).toBe(false);
  });

  it('should set user to null when login is fulfilled with undefined payload', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.fulfilled.type,
      payload: undefined,
    });
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('should set user to null when register is fulfilled with undefined payload', () => {
    const state = reducer(initialAuthState, {
      type: registerAction.fulfilled.type,
      payload: undefined,
    });
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('should set user to null when register is fulfilled with undefined data', () => {
    const state = reducer(initialAuthState, {
      type: registerAction.fulfilled.type,
      payload: { data: undefined },
    });
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
