import { createSlice } from '@reduxjs/toolkit';

import { SessionTimerState } from '@domain/types/sessionTimer';

const SESSION_TIMEOUT_MINUTES = Number(process.env.REACT_APP_SESSION_TIMEOUT_MINUTES) || 15;

const initialState: SessionTimerState = {
  expiresAt: Date.now() + SESSION_TIMEOUT_MINUTES * 60 * 1000,
  showModal: false,
};

const sessionTimerSlice = createSlice({
  name: 'sessionTimer',
  initialState,
  reducers: {
    setExpiresAt(state, action) {
      state.expiresAt = action.payload;
      state.showModal = false;
    },
    resetTimer(state) {
      state.expiresAt = Date.now() + SESSION_TIMEOUT_MINUTES * 60 * 1000;
      state.showModal = false;
    },
    removeExpiresAt(state) {
      state.expiresAt = 0;
      state.showModal = false;
    },
    hideModal(state) {
      state.showModal = false;
    },
    showModal(state) {
      state.showModal = true;
    },
  },
});

export const { setExpiresAt, resetTimer, hideModal, showModal, removeExpiresAt } =
  sessionTimerSlice.actions;
export default sessionTimerSlice.reducer;
