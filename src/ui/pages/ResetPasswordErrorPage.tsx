import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';

const ResetPasswordErrorPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="reset-password" data-testid="reset-password-error-page">
      <div className="reset-password-content">
        <div className="reset-password-error-icon text-center mb-4">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h1 className="text-center" data-testid="reset-password-error-title">
          {t('reset.error.title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="reset-password-error-message">
          <p className="mb-3">{t('reset.error.message')}</p>

          <div className="text-start">
            <p className="mb-2">{t('reset.error.reasons.invalid')}</p>
            <p className="mb-2">{t('reset.error.reasons.expired')}</p>
            <p className="mb-2">{t('reset.error.reasons.already_used')}</p>
            <p className="mb-3">{t('reset.error.reasons.wrong_user')}</p>

            <p className="mb-2 fw-bold">{t('reset.error.solutions')}</p>
            <p className="mb-2">{t('reset.error.solution_retry')}</p>
            <p className="mb-3">{t('reset.error.solution_contact')}</p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link
            to={APP_ROUTES.FORGOT_PASSWORD}
            className="btn btn-theme btn-md me-2"
            data-testid="reset-password-error-retry">
            {t('reset.error.retry')}
          </Link>
          <Link
            to={APP_ROUTES.HOME}
            className="btn btn-outline-theme btn-md"
            data-testid="reset-password-error-back-home">
            {t('global.back_to_home')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordErrorPage;
