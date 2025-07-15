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
          <p className="mb-3">{t('verification.error.message')}</p>

          <div className="text-start">
            <p className="mb-2">{t('verification.error.reasons.invalid')}</p>
            <p className="mb-2">{t('verification.error.reasons.expired')}</p>
            <p className="mb-2">{t('verification.error.reasons.already_used')}</p>
            <p className="mb-3">{t('verification.error.reasons.wrong_user')}</p>

            <p className="mb-2 fw-bold">{t('verification.error.solutions')}</p>
            <p className="mb-2">{t('verification.error.solution_resend')}</p>
            <p className="mb-3">{t('verification.error.solution_contact')}</p>
          </div>
        </div>
        <div className="text-center mt-4">
          <Link
            to={APP_ROUTES.VERIFY_EMAIL_RESEND}
            className="btn btn-theme btn-md me-2"
            data-testid="email-verification-error-resend">
            {t('verification.error.resend')}
          </Link>
          <Link
            to={APP_ROUTES.HOME}
            className="btn btn-outline-theme btn-md"
            data-testid="email-verification-error-back-home">
            {t('verification.error.home')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationErrorPage;
