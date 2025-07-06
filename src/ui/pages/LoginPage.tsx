import { t } from 'i18next';
import React from 'react';

import LoginForm from '@ui/components/Forms/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="login" data-testid="login-page">
      <main className="login-content">
        <h1 className="text-center" data-testid="login-page-title">
          {t('login.title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="login-page-description">
          {t('login.protection_message')}
        </div>
        <LoginForm />
      </main>
    </div>
  );
};

export default LoginPage;
