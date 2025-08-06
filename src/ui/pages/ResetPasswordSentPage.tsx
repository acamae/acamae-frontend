import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';

const ResetPasswordSentPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="reset-password" data-testid="reset-password-sent-page">
      <main className="reset-password-content">
        <div className="reset-password-sent-icon text-center mb-4">
          <i className="fa-solid fa-envelope fa-bounce"></i>
        </div>
        <h1 className="text-center" data-testid="reset-password-sent-title">
          {t('reset.email_sent_title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="reset-password-sent-message">
          <p>{t('reset.email_sent_message')}</p>
        </div>
        <div className="text-center mt-4">
          <Link
            to={APP_ROUTES.HOME}
            className="btn btn-theme btn-md"
            data-testid="reset-password-sent-back-home">
            {t('global.back_to_home')}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordSentPage;
