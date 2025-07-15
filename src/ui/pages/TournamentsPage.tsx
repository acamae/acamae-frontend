import React from 'react';
import { useTranslation } from 'react-i18next';

const TournamentsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="tournaments" data-testid="tournaments-page">
      <main className="tournaments-content">
        <h1 className="text-center" data-testid="tournaments-page-title">
          {t('tournaments.title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="tournaments-page-description">
          {t('tournaments.description')}
        </div>
      </main>
    </div>
  );
};

export default TournamentsPage;
