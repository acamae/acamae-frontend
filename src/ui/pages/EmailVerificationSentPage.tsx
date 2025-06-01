import React from 'react';
import { Col, Row, Container, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const EmailVerificationSentPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container className="py-5" data-testid="email-verification-sent-page">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6} xl={5}>
          <Alert variant="info" dismissible>
            <Alert.Heading>{t('verification.sent.title')}</Alert.Heading>
            <p className="mb-4" data-testid="email-verification-sent-message">
              {t('verification.sent.message')}
            </p>
            <Link to="/" className="btn btn-outline-primary" data-testid="link-back-home">
              {t('common.back_home')}
            </Link>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default EmailVerificationSentPage;
