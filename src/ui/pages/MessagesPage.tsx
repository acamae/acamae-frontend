import React from 'react';
import { Col, Breadcrumb, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';

const MessagesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="messages" data-testid="messages-page">
      <Row className="justify-content-center">
        <Col>
          <Row>
            <Col>
              <Breadcrumb className="text-uppercase">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: APP_ROUTES.DASHBOARD }}>
                  {t('dashboard.title')}
                </Breadcrumb.Item>
                <Breadcrumb.Item active>{t('messages.title')}</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          <Row>
            <main className="messages-content">
              <h1 className="h4" data-testid="messages-page-title">
                <i className="bi bi-envelope text-theme"></i> {t('messages.title')}
              </h1>
              <p
                className="text-inverse text-opacity-50 mb-4"
                data-testid="messages-page-description">
                {t('messages.description')}
              </p>
            </main>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default MessagesPage;
