import React from 'react';
import { useTranslation } from 'react-i18next';

import ResendVerificationForm from '@ui/components/Forms/ResendVerificationForm';

const EmailVerificationResendPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="email-verification-resend" data-testid="email-verification-resend-page">
      <main className="email-verification-resend-content">
        <div className="email-verification-resend-icon text-center mb-4">
          <i className="fa-solid fa-paper-plane"></i>
        </div>
        <h1 className="text-center" data-testid="email-verification-resend-title">
          {t('verification.resend.title')}
        </h1>
        <ResendVerificationForm />
      </main>
    </div>
  );
};

export default EmailVerificationResendPage;
