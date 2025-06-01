import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import LoginForm from '@ui/components/Forms/LoginForm';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6} xl={5}>
          <Card>
            <Card.Header className="text-center">
              <h2 className="mb-4 text-center" data-testid="login-title">
                {t('login.title')}
              </h2>
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

export default LoginPage;
