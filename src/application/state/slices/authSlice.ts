import { createSlice } from '@reduxjs/toolkit';

import {
  loginAction,
  logoutAction,
  registerAction,
  forgotPasswordAction,
  resetPasswordAction,
} from '@application/state/actions/auth.actions';
import { AuthState } from '@domain/types/auth';

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  expiresAt: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Login
      .addCase(loginAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAction.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.data ?? null;
      })
      .addCase(loginAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      // Logout
      .addCase(logoutAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutAction.fulfilled, state => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logoutAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      // Register
      .addCase(registerAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAction.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.data ?? null;
      })
      .addCase(registerAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      // Forgot password
      .addCase(forgotPasswordAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordAction.fulfilled, state => {
        state.loading = false;
      })
      .addCase(forgotPasswordAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      // Reset password
      .addCase(resetPasswordAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordAction.fulfilled, state => {
        state.loading = false;
      })
      .addCase(resetPasswordAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
  },
});

export default authSlice.reducer;
