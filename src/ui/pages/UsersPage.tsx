import React from 'react';
import { useTranslation } from 'react-i18next';

const UsersPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="users" data-testid="users-page">
      <main className="users-content">
        <h1 className="text-center" data-testid="users-page-title">
          {t('users.title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="users-page-description">
          {t('users.description')}
        </div>
      </main>
    </div>
  );
};

export default UsersPage;
