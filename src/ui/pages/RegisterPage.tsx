import React from 'react';
import { useTranslation } from 'react-i18next';

import RegisterForm from '@ui/components/Forms/RegisterForm';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="register" data-testid="register-page">
      <main className="register-content">
        <h1 className="text-center" data-testid="register-page-title">
          {t('register.title')}
        </h1>
        <RegisterForm />
      </main>
    </div>
  );
};

export default RegisterPage;
