import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import RegisterForm from '@/ui/components/Forms/RegisterForm';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6} xl={5}>
          <Card>
            <Card.Header className="text-center">
              <h2 className="mb-4 text-center" data-testid="register-title">
                {t('register.title')}
              </h2>
            </Card.Header>
            <Card.Body>
              <RegisterForm redirectTo="/login?registrationSuccess=true" />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
