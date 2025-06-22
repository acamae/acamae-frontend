import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';

const EmailAlreadyVerified: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="email-verification" data-testid="email-already-verified-page">
      <div className="email-verification-content">
        <div className="email-verification-icon text-center mb-4">
          <i className="fa-solid fa-envelope"></i>
        </div>
        <h1 className="text-center" data-testid="email-already-verified-title">
          {t('verification.already.title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="email-already-verified-message">
          <p>{t('verification.already.message')}</p>
        </div>
        <div className="text-center mt-4">
          <Link
            to={APP_ROUTES.HOME}
            className="btn btn-theme btn-md"
            data-testid="email-already-verified-back-home">
            {t('global.back_to_home')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailAlreadyVerified;
