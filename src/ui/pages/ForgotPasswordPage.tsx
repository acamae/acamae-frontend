import { Container, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import ForgotPasswordForm from '@ui/components/Forms/ForgotPasswordForm';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6} xl={5}>
          <Card>
            <Card.Header className="text-center">
              <h2 data-testid="forgot-password-title">{t('forgot.title')}</h2>
            </Card.Header>
            <Card.Body>
              <ForgotPasswordForm />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPasswordPage;
