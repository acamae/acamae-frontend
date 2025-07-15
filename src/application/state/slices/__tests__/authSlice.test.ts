import {
  loginAction,
  logoutAction,
  registerAction,
  forgotPasswordAction,
  resetPasswordAction,
} from '@application/state/actions/auth.actions';
import reducer, { initialAuthState } from '@application/state/slices/authSlice';
import { USER_ROLES } from '@domain/constants/user';
import { tokenService } from '@infrastructure/storage/tokenService';

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
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
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
      jest.spyOn(tokenService, 'getAccessToken').mockReturnValue('mocktoken');
      const state = reducer(initialAuthState, {
        type: actionCreator.fulfilled.type,
        payload: { data: user, success: true },
      });
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('a@b.com');
      jest.restoreAllMocks();
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

  it('should set user, token, isAuthenticated correctly when login is fulfilled with success false', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.fulfilled.type,
      payload: { success: false, data: { id: 'x' } },
    });
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set loading to false when login is rejected', () => {
    const state = reducer(
      { ...initialAuthState, loading: true },
      { type: loginAction.rejected.type }
    );
    expect(state.loading).toBe(false);
  });

  it('should set loading to false when register is rejected', () => {
    const state = reducer(
      { ...initialAuthState, loading: true },
      { type: registerAction.rejected.type }
    );
    expect(state.loading).toBe(false);
  });

  it('should set loading to false when logout is rejected', () => {
    const state = reducer(
      { ...initialAuthState, loading: true },
      { type: logoutAction.rejected.type }
    );
    expect(state.loading).toBe(false);
  });

  it('should set loading to false when forgotPassword is rejected', () => {
    const state = reducer(
      { ...initialAuthState, loading: true },
      { type: forgotPasswordAction.rejected.type }
    );
    expect(state.loading).toBe(false);
  });

  it('should set loading to false when resetPassword is rejected', () => {
    const state = reducer(
      { ...initialAuthState, loading: true },
      { type: resetPasswordAction.rejected.type }
    );
    expect(state.loading).toBe(false);
  });

  it('should set user when register is fulfilled with data', () => {
    const user = {
      id: '2',
      email: 'b@b.com',
      username: 'bob',
      role: USER_ROLES.USER,
      createdAt: '',
      updatedAt: '',
    };
    const state = reducer(initialAuthState, {
      type: registerAction.fulfilled.type,
      payload: { data: user },
    });
    expect(state.user).toEqual(user);
  });

  it('should set user to null when register is fulfilled with no data', () => {
    const state = reducer(initialAuthState, {
      type: registerAction.fulfilled.type,
      payload: {},
    });
    expect(state.user).toBeNull();
  });

  it('should handle login fulfilled with null payload', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.fulfilled.type,
      payload: null,
    });
    expect(state.loading).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle login fulfilled with undefined success', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.fulfilled.type,
      payload: { data: user },
    });
    expect(state.loading).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle login fulfilled with null success', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.fulfilled.type,
      payload: { data: user, success: null },
    });
    expect(state.loading).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle login fulfilled with empty string success', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.fulfilled.type,
      payload: { data: user, success: '' },
    });
    expect(state.loading).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle login fulfilled with zero success', () => {
    const state = reducer(initialAuthState, {
      type: loginAction.fulfilled.type,
      payload: { data: user, success: 0 },
    });
    expect(state.loading).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
