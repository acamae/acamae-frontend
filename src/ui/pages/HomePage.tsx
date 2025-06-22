import React from 'react';
import { useTranslation } from 'react-i18next';

const HomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="home" data-testid="home-page">
      <div className="home-content">
        <h1 className="text-center" data-testid="home-page-title">
          {t('home.title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="home-page-description">
          {t('home.description')}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
