import { useDispatch, useSelector } from 'react-redux';

import type { RootState, AppDispatch } from '@domain/types/redux';

// Always use the custom hooks (useAppDispatch, useAppSelector) in the app,
// to avoid manually typing each useDispatch or useSelector.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
