import React from 'react';
import { useTranslation } from 'react-i18next';

import ResendVerificationForm from '@ui/components/Forms/ResendVerificationForm';

const ResendVerificationPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="resend-verification" data-testid="resend-verification-page">
      <div className="resend-verification-content">
        <h1 className="text-center" data-testid="resend-verification-title">
          {t('verification.resend.title')}
        </h1>
        <ResendVerificationForm />
      </div>
    </div>
  );
};

export default ResendVerificationPage;
