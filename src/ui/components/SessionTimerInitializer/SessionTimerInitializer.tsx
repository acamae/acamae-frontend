import { useEffect } from 'react';

import { logoutAction } from '@application/state/actions/auth.actions';
import { useAppDispatch, useAppSelector } from '@application/state/hooks';
import { setExpiresAt, showModal } from '@application/state/slices/sessionTimerSlice';
import { sessionExpiryService } from '@infrastructure/storage/sessionExpiryService';

const SESSION_TIMEOUT_WARNING_SECONDS =
  Number(process.env.REACT_APP_SESSION_TIMEOUT_WARNING_SECONDS) || 30;

export default function SessionTimerInitializer() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    const expiresAt = sessionExpiryService.getExpiresAt();
    if (expiresAt && expiresAt > Date.now()) {
      dispatch(setExpiresAt(expiresAt));
      const secondsLeft = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      if (secondsLeft <= SESSION_TIMEOUT_WARNING_SECONDS) {
        dispatch(showModal());
      }
    } else {
      dispatch(logoutAction());
    }
  }, [dispatch, isAuthenticated]);

  return null;
}
