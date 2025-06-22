import React from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';
import { Card, CardBody } from '@ui/components/Card';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBackBtn = () => {
    navigate(-1);
  };

  return (
    <div className="error-page" data-testid="not-found-page">
      <div className="error-page-content">
        <Card className="mb-5 mx-auto">
          <CardBody>
            <Card>
              <div className="error-code">404</div>
            </Card>
          </CardBody>
        </Card>
        <h1 data-testid="not-found-title">{t('not_found.title', 'Página no encontrada')}</h1>
        <p className="lead" data-testid="not-found-message">
          {t('not_found.message', 'La ruta que intentas acceder no existe.')}
        </p>
        <hr />
        <p className="mb-1">{t('not_found.help_message')}</p>
        <p className="mb-5">
          <Link
            to={APP_ROUTES.HOME}
            className="text-decoration-none text-inverse text-opacity-50"
            data-testid="link-back-home">
            {t('global.back_to_home')}
          </Link>
          <span className="link-divider"></span>
          <Link
            to={APP_ROUTES.LOGIN}
            className="text-decoration-none text-inverse text-opacity-50"
            data-testid="link-login">
            {t('login.title')}
          </Link>
        </p>
        <Button
          onClick={handleBackBtn}
          variant="outline-theme"
          size="lg"
          className="rounded-pill"
          data-testid="button-back">
          <i className="fa fa-arrow-left me-1 ms-n1"></i> {t('global.go_back')}
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
