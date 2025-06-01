import React from 'react';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';

import PublicHeader from '@ui/components/PublicHeader';

const PublicLayout: React.FC = () => (
  <>
    <PublicHeader />
    <Container className="py-4">
      <Outlet />
    </Container>
  </>
);

export default PublicLayout;
