import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';

const EmailVerificationUsedPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="email-verification" data-testid="email-verification-used-page">
      <div className="email-verification-content">
        <div className="email-verification-icon text-center mb-4">
          <i className="fa-solid fa-envelope-circle-check"></i>
        </div>
        <h1 className="text-center" data-testid="email-verification-used-title">
          {t('verification.used.title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="email-verification-used-message">
          <p>{t('verification.used.message')}</p>
        </div>
        <div className="text-center mt-4">
          <Link
            to={APP_ROUTES.LOGIN}
            className="btn btn-theme btn-md"
            data-testid="email-verification-used-login">
            {t('verification.used.login')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationUsedPage;
