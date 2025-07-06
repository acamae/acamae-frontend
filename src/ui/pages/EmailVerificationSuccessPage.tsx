import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';

const EmailVerificationSuccess: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="email-verification" data-testid="email-verification-success-page">
      <main className="email-verification-content">
        <div className="email-verification-icon text-center mb-4">
          <i className="fa-solid fa-envelope"></i>
        </div>
        <h1 className="text-center" data-testid="email-verification-success-title">
          {t('verification.success.title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="email-verification-success-message">
          <p className="mb-4">{t('verification.success.message')}</p>
        </div>
        <div className="text-center mt-4">
          <Link
            to={APP_ROUTES.LOGIN}
            className="btn btn-theme btn-md"
            data-testid="email-verification-success-login">
            {t('verification.success.login')}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default EmailVerificationSuccess;
