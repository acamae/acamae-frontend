import React from 'react';
import { Col, Row, Container, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const EmailVerificationSuccess: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container className="py-5" data-testid="email-verification-success-page">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6} xl={5}>
          <Alert variant="success" dismissible>
            <Alert.Heading data-testid="email-verification-success-title">
              {t('verification.success.title')}
            </Alert.Heading>
            <p className="mb-4" data-testid="email-verification-success-message">
              {t('verification.success.message')}
            </p>
            <Link
              to="/login"
              className="btn btn-primary mt-3"
              data-testid="email-verification-success-login">
              {t('verification.success.login')}
            </Link>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default EmailVerificationSuccess;
