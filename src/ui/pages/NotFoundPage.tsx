import React from 'react';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container className="text-center mt-5" data-testid="not-found-page">
      <h1 className="display-4" data-testid="not-found-title">
        {t('not_found.title', 'Página no encontrada')}
      </h1>
      <p className="lead" data-testid="not-found-message">
        {t('not_found.message', 'La ruta que intentas acceder no existe.')}
      </p>
      <Link to="/" className="btn btn-primary mt-3" data-testid="link-back-home">
        {t('not_found.back_to_home', 'Volver al inicio')}
      </Link>
    </Container>
  );
};

export default NotFoundPage;
