import React from 'react';
import { Breadcrumb, Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';

const TeamsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="teams" data-testid="teams-page">
      <Row className="justify-content-center">
        <Col>
          <Row>
            <Col>
              <Breadcrumb className="text-uppercase">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: APP_ROUTES.DASHBOARD }}>
                  {t('dashboard.title')}
                </Breadcrumb.Item>
                <Breadcrumb.Item active>{t('teams.title')}</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          <Row>
            <main className="teams-content">
              <h1 className="h4" data-testid="teams-page-title">
                <i className="bi bi-people text-theme"></i> {t('teams.title')}
              </h1>
              <p className="text-inverse text-opacity-50 mb-4" data-testid="teams-page-description">
                {t('teams.description')}
              </p>
            </main>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default TeamsPage;
