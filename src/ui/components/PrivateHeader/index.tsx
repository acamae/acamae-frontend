import React from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@/shared/constants/appRoutes';
import LanguageSelector from '@ui/components/LanguageSelector';
import { useAuth } from '@ui/hooks/useAuth';

const PrivateHeader: React.FC = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div id="header" className="app-header" data-testid="private-header">
      <div className="desktop-toogler">
        <Button
          className="menu-toggler"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </Button>
      </div>

      <div className="brand">
        <Link to={APP_ROUTES.DASHBOARD} className="brand-logo" data-testid="link-dashboard">
          <span className="brand-img"></span>
          <span className="brand-text">{t('app.name')}</span>
        </Link>
      </div>

      <div className="menu">
        <div className="menu-item">
          <div className="menu-link">
            <Link
              to={APP_ROUTES.PROFILE}
              className="btn btn-outline-light btn-sm"
              data-testid="link-profile">
              {t('nav.profile')}
            </Link>
          </div>
        </div>
        <div className="menu-item">
          <div className="menu-link">
            <Link
              to={APP_ROUTES.TEAMS}
              className="btn btn-outline-light btn-sm"
              data-testid="link-teams">
              {t('nav.teams')}
            </Link>
          </div>
        </div>
        <div className="menu-item dropdown">
          <div className="menu-link">
            <LanguageSelector />
          </div>
        </div>
        <div className="menu-item">
          <button onClick={handleLogout} className="btn btn-danger btn-sm" data-testid="btn-logout">
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivateHeader;
