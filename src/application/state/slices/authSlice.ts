import { createSlice } from '@reduxjs/toolkit';

import {
  loginAction,
  registerAction,
  logoutAction,
  forgotPasswordAction,
  resetPasswordAction,
} from '@application/state/actions/auth.actions';
import { User } from '@domain/entities/User';

interface AuthState {
  // Estado persistente
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  expiresAt: string | null;
  // Estado transitorio (no persistente)
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  expiresAt: null,
  loading: false,
};

export const initialAuthState = initialState;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Login
      .addCase(loginAction.pending, state => {
        state.loading = true;
      })
      .addCase(loginAction.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.user = action.payload.data;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(loginAction.rejected, state => {
        state.loading = false;
      })
      // Register
      .addCase(registerAction.pending, state => {
        state.loading = true;
      })
      .addCase(registerAction.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.user = action.payload.data;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(registerAction.rejected, state => {
        state.loading = false;
      })
      // Logout
      .addCase(logoutAction.pending, state => {
        state.loading = true;
      })
      .addCase(logoutAction.fulfilled, state => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addCase(logoutAction.rejected, state => {
        state.loading = false;
      })
      // Forgot Password
      .addCase(forgotPasswordAction.pending, state => {
        state.loading = true;
      })
      .addCase(forgotPasswordAction.fulfilled, state => {
        state.loading = false;
      })
      .addCase(forgotPasswordAction.rejected, state => {
        state.loading = false;
      })
      // Reset Password
      .addCase(resetPasswordAction.pending, state => {
        state.loading = true;
      })
      .addCase(resetPasswordAction.fulfilled, state => {
        state.loading = false;
      })
      .addCase(resetPasswordAction.rejected, state => {
        state.loading = false;
      });
  },
});

export default authSlice.reducer;
