import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

import { useAppDispatch, useAppSelector } from '@application/state/hooks';
import rootReducer from '@application/state/rootReducer';

describe('Redux Hooks', () => {
  const store = configureStore({
    reducer: rootReducer,
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  describe('useAppDispatch', () => {
    it('should return a dispatch function', () => {
      const { result } = renderHook(() => useAppDispatch(), { wrapper });
      expect(typeof result.current).toBe('function');
    });
  });

  describe('useAppSelector', () => {
    it('should return the initial state', () => {
      const { result } = renderHook(() => useAppSelector(state => state.auth), { wrapper });
      expect(result.current).toBeDefined();
    });

    it('should select specific state slice', () => {
      const { result } = renderHook(() => useAppSelector(state => state.auth), { wrapper });
      expect(result.current).toBeDefined();
    });
  });
});
