import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { APP_ROUTES } from '@shared/constants/appRoutes';
import { useEmailVerification } from '@ui/hooks/useEmailVerification';

const EmailVerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { status, errorCode, verify } = useEmailVerification();

  // Ejecutar verificación al montar
  useEffect(() => {
    verify(searchParams.get('token'));
  }, []);

  // Reaccionar a cambios de estado
  useEffect(() => {
    switch (status) {
      case 'MISSING_TOKEN':
        navigate(APP_ROUTES.VERIFY_EMAIL_RESEND, { replace: true });
        break;
      case 'SUCCESS':
        navigate(APP_ROUTES.VERIFY_EMAIL_SUCCESS, { replace: true });
        break;
      case 'ERROR':
        switch (errorCode) {
          case ApiErrorCodes.AUTH_TOKEN_EXPIRED:
          case ApiErrorCodes.AUTH_TOKEN_INVALID:
          case ApiErrorCodes.AUTH_TOKEN_REVOKED:
            navigate(APP_ROUTES.VERIFY_EMAIL_EXPIRED, { replace: true });
            break;
          case ApiErrorCodes.AUTH_TOKEN_ALREADY_USED:
            navigate(APP_ROUTES.VERIFY_EMAIL_USED, { replace: true });
            break;
          case ApiErrorCodes.AUTH_USER_ALREADY_VERIFIED:
            navigate(APP_ROUTES.VERIFY_EMAIL_ALREADY_VERIFIED, { replace: true });
            break;
          default:
            navigate(APP_ROUTES.VERIFY_EMAIL_ERROR, { replace: true });
        }
        break;
      default:
        break;
    }
  }, [status, errorCode, navigate]);

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      data-testid="email-verification-page">
      <div className="spinner-border text-theme" role="status" aria-live="polite">
        <span className="visually-hidden">{t('global.processing')}</span>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
