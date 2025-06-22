import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';

const EmailVerificationSentPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="email-verification" data-testid="email-verification-sent-page">
      <div className="email-verification-content">
        <div className="email-verification-icon text-center mb-4">
          <i className="fa-solid fa-envelope fa-bounce"></i>
        </div>
        <h1 className="text-center" data-testid="email-verification-sent-title">
          {t('verification.sent.title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="email-verification-sent-message">
          <p>{t('verification.sent.message')}</p>
        </div>
        <div className="text-center mt-4">
          <Link
            to={APP_ROUTES.HOME}
            className="btn btn-theme btn-md"
            data-testid="email-verification-sent-back-home">
            {t('global.back_to_home')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationSentPage;
