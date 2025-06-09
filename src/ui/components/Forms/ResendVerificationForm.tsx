import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { APP_ROUTES } from '@shared/constants/appRoutes';
import api from '@shared/services/axiosService';

const ResendVerificationForm: React.FC = () => {
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      await api.post(APP_ROUTES.VERIFY_EMAIL_RESEND, { identifier });
      setStatus('success');
      setMessage(t('verification.resend.success'));
    } catch (err: unknown) {
      setStatus('error');
      let finalErrorMessage = t('errors.unknown');
      if (err instanceof Error && err.message) {
        if (err.message === 'USER_NOT_FOUND') {
          finalErrorMessage = t('errors.email.not_found');
        } else if (err.message === 'ALREADY_VERIFIED') {
          finalErrorMessage = t('email.verification_repeat');
        }
      }
      setMessage(finalErrorMessage);
    }
  };

  return (
    <>
      {status !== 'idle' && (
        <Alert
          variant={status === 'success' ? 'success' : 'danger'}
          data-testid={status === 'success' ? 'alert-success' : 'alert-error'}>
          {message}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="identifier">
          <Form.Label>{t('verification.resend.label')}</Form.Label>
          <Form.Control
            type="text"
            value={identifier}
            onChange={e => setIdentifier(e.target.value.trim())}
            required
            autoFocus
            data-testid="input-email-username"
          />
        </Form.Group>

        <div className="d-grid">
          <Button
            variant="primary"
            type="submit"
            disabled={status === 'loading'}
            data-testid="btn-resend-verification">
            {status === 'loading'
              ? t('verification.resend.loading')
              : t('verification.resend.button')}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default ResendVerificationForm;
