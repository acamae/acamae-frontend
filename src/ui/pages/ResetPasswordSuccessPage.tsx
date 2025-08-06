import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';

const ResetPasswordSuccessPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="reset-password" data-testid="reset-password-success-page">
      <main className="reset-password-content">
        <div className="reset-password-success-icon text-center mb-4">
          <i className="fa-solid fa-check-circle"></i>
        </div>
        <h1 className="text-center" data-testid="reset-password-success-title">
          {t('reset.success.title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="reset-password-success-message">
          <p className="mb-4">{t('reset.success.message')}</p>
        </div>
        <div className="text-center mt-4">
          <Link
            to={APP_ROUTES.LOGIN}
            className="btn btn-theme btn-md"
            data-testid="reset-password-success-login">
            {t('reset.success.login')}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordSuccessPage;
