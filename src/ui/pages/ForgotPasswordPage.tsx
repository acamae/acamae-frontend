import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';
import ForgotPasswordForm from '@ui/components/Forms/ForgotPasswordForm';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Callback para manejar el éxito
  const handleSuccess = useCallback(() => {
    navigate(APP_ROUTES.RESET_PASSWORD_SENT);
  }, [navigate]);

  return (
    <div className="forgot-password" data-testid="forgot-password-page">
      <main className="forgot-password-content">
        <h1 className="text-center" data-testid="forgot-password-title">
          {t('forgot.title')}
        </h1>
        <ForgotPasswordForm onSuccess={handleSuccess} />
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
