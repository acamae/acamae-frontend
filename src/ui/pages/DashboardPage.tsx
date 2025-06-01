import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container className="py-5" data-testid="dashboard-page">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6} xl={5}>
          <Card>
            <Card.Header className="text-center">
              <h2 className="mb-4 text-center" data-testid="dashboard-title">
                {t('dashboard.title')}
              </h2>
            </Card.Header>
            <Card.Body>
              <p className="lead" data-testid="dashboard-welcome">
                {t('dashboard.welcome_message')}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
