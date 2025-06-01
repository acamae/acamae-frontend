import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';

import { logoutAction } from '@application/state/actions/auth.actions';
import { useAppDispatch, useAppSelector } from '@application/state/hooks';
import { resetTimer, hideModal } from '@application/state/slices/sessionTimerSlice';
import type { RootState } from '@domain/types/redux';

const SessionTimeoutModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { showModal, expiresAt } = useAppSelector((state: RootState) => state.sessionTimer);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!showModal) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [showModal]);

  const secondsLeft = expiresAt ? Math.max(0, Math.floor((expiresAt - now) / 1000)) : 0;
  if (!showModal) return null;

  return (
    <Modal show={showModal} backdrop="static" keyboard={false} centered>
      <Modal.Header>
        <Modal.Title>{t('sessionTimeout.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Trans
          i18nKey="sessionTimeout.body"
          values={{ seconds: secondsLeft }}
          components={[<span key="bold" className="fw-bold" />]}
        />
        <br />
        {t('sessionTimeout.question')}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            dispatch(hideModal());
            dispatch(logoutAction());
          }}>
          {t('sessionTimeout.logout')}
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            dispatch(resetTimer());
          }}>
          {t('sessionTimeout.stayConnected')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SessionTimeoutModal;
