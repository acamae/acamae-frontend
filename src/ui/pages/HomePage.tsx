import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import LoginForm from '@ui/components/Forms/LoginForm';

const HomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container className="py-5" data-testid="home-page">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6} xl={5}>
          <Card>
            <Card.Header className="text-center">
              <h2 className="mb-4 text-center" data-testid="home-title">
                {t('home.title')}
              </h2>

              <p className="text-center mb-4" data-testid="home-description">
                {t('home.description')}
              </p>
            </Card.Header>
            <Card.Body>
              <LoginForm redirectTo="/dashboard" />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
