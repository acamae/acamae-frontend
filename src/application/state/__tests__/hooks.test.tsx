import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

import { useAppDispatch, useAppSelector } from '@application/state/hooks';
import rootReducer from '@application/state/rootReducer';

const store = configureStore({ reducer: rootReducer });

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={store}>{children}</Provider>
);

const selectAuth = (state: ReturnType<typeof store.getState>) => state.auth;

describe('Redux Hooks', () => {
  describe('useAppDispatch', () => {
    it('should return a dispatch function', () => {
      const { result } = renderHook(() => useAppDispatch(), { wrapper: Wrapper });
      expect(typeof result.current).toBe('function');
    });
  });

  describe('useAppSelector', () => {
    it('should return the initial state', () => {
      const { result } = renderHook(() => useAppSelector(selectAuth), { wrapper: Wrapper });
      expect(result.current).toBeDefined();
    });

    it('should select specific state slice', () => {
      const { result } = renderHook(() => useAppSelector(selectAuth), { wrapper: Wrapper });
      expect(result.current).toBeDefined();
    });
  });
});
