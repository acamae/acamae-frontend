import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';

const ResetPasswordExpiredPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="reset-password" data-testid="reset-password-expired-page">
      <main className="reset-password-content">
        <div className="reset-password-expired-icon text-center mb-4">
          <i className="fa-solid fa-clock"></i>
        </div>
        <h1 className="text-center" data-testid="reset-password-expired-title">
          {t('reset.expired.title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="reset-password-expired-message">
          <p>{t('reset.expired.message')}</p>
        </div>
        <div className="text-center mt-4">
          <Link
            to={APP_ROUTES.FORGOT_PASSWORD}
            className="btn btn-theme btn-md"
            data-testid="reset-password-expired-retry">
            {t('reset.expired.retry')}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordExpiredPage;
