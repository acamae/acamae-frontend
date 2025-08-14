import React from 'react';
import { Breadcrumb, Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { Card, CardBody } from '@ui/components/Card/Card';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div data-testid="dashboard-page">
      <Row className="justify-content-center">
        <Col>
          <Row>
            <Col>
              <Breadcrumb className="text-uppercase">
                <Breadcrumb.Item active>{t('dashboard.title')}</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          <main className="dashboard-content">
            <Row>
              <h1 className="h4" data-testid="dashboard-page-title">
                <i className="bi bi-cpu text-theme"></i> {t('dashboard.title')}
              </h1>
              <p
                className="text-inverse text-opacity-50 mb-4"
                data-testid="dashboard-page-description">
                {t('dashboard.description')}
              </p>
            </Row>
            <Row>
              <Col xs={12} md={12} lg={4}>
                <Card className="mb-3">
                  <CardBody>
                    <div className="d-flex fw-bold small mb-3">
                      <span className="flex-grow-1">{t('dashboard.cards.messages.title')}</span>
                    </div>
                    <div className="row align-items-center mb-2">
                      <div className="col-7">
                        <h3 className="mb-0">
                          <i className="fa fa-envelope"></i>
                        </h3>
                      </div>
                      <div className="col-5">
                        <div className="mt-n2 h1">0</div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs={12} md={12} lg={4}>
                <Card className="mb-3">
                  <CardBody>
                    <div className="d-flex fw-bold small mb-3">
                      <span className="flex-grow-1">{t('dashboard.cards.messages.title')}</span>
                    </div>
                    <div className="row align-items-center mb-2">
                      <div className="col-7">
                        <h3 className="mb-0">
                          <i className="fa fa-envelope"></i>
                        </h3>
                      </div>
                      <div className="col-5">
                        <div className="mt-n2 h1">0</div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xs={12} md={12} lg={4}>
                <Card className="mb-3">
                  <CardBody>
                    <div className="d-flex fw-bold small mb-3">
                      <span className="flex-grow-1">{t('dashboard.cards.messages.title')}</span>
                    </div>
                    <div className="row align-items-center mb-2">
                      <div className="col-7">
                        <h3 className="mb-0">
                          <i className="fa fa-envelope"></i>
                        </h3>
                      </div>
                      <div className="col-5">
                        <div className="mt-n2 h1">0</div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </main>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
