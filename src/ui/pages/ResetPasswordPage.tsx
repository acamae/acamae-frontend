import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import ResetPasswordForm from '@ui/components/Forms/ResetPasswordForm';

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  return (
    <div className="reset-password" data-testid="reset-password-page">
      <div className="reset-password-content">
        <h1 className="text-center" data-testid="reset-password-title">
          {t('reset.title')}
        </h1>
        <ResetPasswordForm tokenProp={token} />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
