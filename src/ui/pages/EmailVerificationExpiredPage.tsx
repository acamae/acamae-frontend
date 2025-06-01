import React from 'react';
import { Col, Row, Container, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const EmailVerificationExpired: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container className="py-5" data-testid="email-verification-expired-page">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6} xl={5}>
          <Alert variant="danger" dismissible>
            <Alert.Heading>{t('verification.expired.title')}</Alert.Heading>
            <p className="mb-4" data-testid="email-verification-expired-message">
              {t('verification.expired.message')}
            </p>
            <Link
              to="/resend-verification"
              className="btn btn-primary"
              data-testid="link-resend-verification">
              {t('verification.expired.resend')}
            </Link>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default EmailVerificationExpired;
