import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import ResendVerificationForm from '@ui/components/Forms/ResendVerificationForm';

const ResendVerificationPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6} xl={5}>
          <Card>
            <Card.Header className="text-center">
              <h2 data-testid="resend-verification-title">{t('verification.resend.title')}</h2>
            </Card.Header>
            <Card.Body>
              <ResendVerificationForm />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResendVerificationPage;
