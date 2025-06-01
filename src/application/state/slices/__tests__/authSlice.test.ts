import authReducer, { initialAuthState } from '@application/state/slices/authSlice';

describe('authSlice', () => {
  it('debe tener el estado inicial correcto (incluyendo token y expiresAt)', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialAuthState);
  });
});
