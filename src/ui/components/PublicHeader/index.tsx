import React from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';
import LanguageSelector from '@ui/components/LanguageSelector';
import { useAuth } from '@ui/hooks/useAuth';

const PublicHeader: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div id="header" className="app-header" data-testid="public-header">
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
        <Link to={APP_ROUTES.HOME} className="brand-logo" data-testid="link-home">
          <span className="brand-img"></span>
          <span className="brand-text">{t('app.name')}</span>
        </Link>
      </div>
      <div className="menu">
        {user ? (
          <div className="menu-item">
            <div className="menu-link">
              <Link
                to={APP_ROUTES.DASHBOARD}
                className="btn btn-outline-theme btn-md text-nowrap"
                data-testid="link-dashboard-nav">
                {t('nav.dashboard')}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="menu-item">
              <div className="menu-link">
                <Link
                  to={APP_ROUTES.LOGIN}
                  className="btn btn-outline-theme btn-md text-nowrap"
                  data-testid="link-login-nav">
                  {t('nav.login')}
                </Link>
              </div>
            </div>
            <div className="menu-item">
              <div className="menu-link">
                <Link
                  to={APP_ROUTES.REGISTER}
                  className="btn btn-theme btn-md"
                  data-testid="link-register">
                  {t('nav.register')}
                </Link>
              </div>
            </div>
            <div className="menu-item dropdown dropdown-mobile-full">
              <div className="menu-link">
                <LanguageSelector />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PublicHeader;
