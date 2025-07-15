import React from 'react';
import { useTranslation } from 'react-i18next';

const USerProfilePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="user-profile" data-testid="user-profile-page">
      <main className="user-profile-content">
        <h1 className="text-center" data-testid="user-profile-page-title">
          {t('user-profile.title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="user-profile-page-description">
          {t('user-profile.description')}
        </div>
      </main>
    </div>
  );
};

export default USerProfilePage;
