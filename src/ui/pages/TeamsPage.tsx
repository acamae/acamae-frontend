import React from 'react';
import { useTranslation } from 'react-i18next';

const TeamsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="teams" data-testid="teams-page">
      <main className="teams-content">
        <h1 className="text-center" data-testid="teams-page-title">
          {t('teams.title')}
        </h1>
        <div
          className="text-inverse text-opacity-50 text-center mb-4"
          data-testid="teams-page-description">
          {t('teams.description')}
        </div>
      </main>
    </div>
  );
};

export default TeamsPage;
