import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';

const EmailVerificationErrorPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="email-verification" data-testid="email-verification-error-page">
      <div className="email-verification-content">
        <div className="email-verification-icon text-center mb-4">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h1 className="text-center" data-testid="email-verification-error-title">
          {t('verification.error.title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="email-verification-error-message">
          <p>{t('verification.error.message')}</p>
        </div>
        <div className="text-center mt-4">
          <Link
            to={APP_ROUTES.HOME}
            className="btn btn-theme btn-md"
            data-testid="email-verification-error-back-home">
            {t('global.back_to_home')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationErrorPage;
