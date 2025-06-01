import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useAuth } from '@/ui/hooks/useAuth';
import LanguageSelector from '@ui/components/LanguageSelector';

const PrivateHeader: React.FC = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/dashboard" data-testid="link-dashboard">
        {t('app.name')}
      </Link>

      <div className="ms-auto d-flex align-items-center gap-3">
        <LanguageSelector />
        <Link
          to="/dashboard"
          className="btn btn-outline-light btn-sm"
          data-testid="link-dashboard-nav">
          {t('nav.dashboard')}
        </Link>
        <Link to="/profile" className="btn btn-outline-light btn-sm" data-testid="link-profile">
          {t('nav.profile')}
        </Link>
        <Link to="/teams" className="btn btn-outline-light btn-sm" data-testid="link-teams">
          {t('nav.teams')}
        </Link>
        <button onClick={handleLogout} className="btn btn-danger btn-sm" data-testid="btn-logout">
          {t('nav.logout')}
        </button>
      </div>
    </nav>
  );
};

export default PrivateHeader;
