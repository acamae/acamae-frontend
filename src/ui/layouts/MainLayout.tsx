import React from 'react';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';

import PrivateHeader from '@ui/components/PrivateHeader';
import SessionTimeoutModal from '@ui/components/SessionTimeoutModal/SessionTimeoutModal';
import SessionTimerInitializer from '@ui/components/SessionTimerInitializer/SessionTimerInitializer';

const MainLayout: React.FC = () => {
  return (
    <>
      <SessionTimerInitializer />
      <PrivateHeader />
      <Container className="py-4">
        <Outlet />
      </Container>
      <SessionTimeoutModal />
    </>
  );
};

export default MainLayout;
