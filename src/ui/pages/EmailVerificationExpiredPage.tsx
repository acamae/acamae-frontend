import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';

const EmailVerificationExpired: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="email-verification" data-testid="email-verification-expired-page">
      <main className="email-verification-content">
        <div className="email-verification-icon text-center mb-4">
          <i className="fa-solid fa-envelope"></i>
        </div>
        <h1 className="text-center" data-testid="email-verification-expired-title">
          {t('verification.expired.title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="email-verification-expired-message">
          <p>{t('verification.expired.message')}</p>
        </div>
        <div className="text-center mt-4">
          <Link
            to={APP_ROUTES.VERIFY_EMAIL_RESEND}
            className="btn btn-theme btn-md"
            data-testid="email-verification-expired-resend">
            {t('verification.expired.resend')}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default EmailVerificationExpired;
