import React from 'react';
import { Card, Col, Row, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import ResetPasswordForm from '@ui/components/Forms/ResetPasswordForm';

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  return (
    <Container className="py-5">
      <Row className="justify-content-center" data-testid="reset-password-page">
        <Col xs={12} md={8} lg={6} xl={5}>
          <Card>
            <Card.Header className="text-center">
              <h2 className="mb-4 text-center" data-testid="reset-password-title">
                {t('reset.title')}
              </h2>
            </Card.Header>
            <Card.Body>
              <ResetPasswordForm token={token} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPasswordPage;
