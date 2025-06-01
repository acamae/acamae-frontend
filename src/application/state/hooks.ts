import { useDispatch, useSelector } from 'react-redux';

import type { RootState, AppDispatch } from '@domain/types/redux';

// usar siempre los hooks personalizados (useAppDispatch, useAppSelector) en toda la app,
// y así evitar tener que tipar manualmente cada uso de useDispatch o useSelector.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
