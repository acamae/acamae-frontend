import React from 'react';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';

import { LayoutOptions } from '@domain/types/layoutOptions';
import { DEFAULT_LAYOUT_OPTIONS } from '@shared/constants/layoutOptions';
import FeedbackInitializer from '@ui/components/FeedbackInitializer';
import PrivateFooter from '@ui/components/PrivateFooter';
import PrivateHeader from '@ui/components/PrivateHeader';
import SessionTimeoutModal from '@ui/components/SessionTimeoutModal/SessionTimeoutModal';
import SessionTimerInitializer from '@ui/components/SessionTimerInitializer/SessionTimerInitializer';

interface MainLayoutProps {
  options?: Partial<LayoutOptions>;
}

const MainLayout: React.FC<MainLayoutProps> = ({ options = {} }) => {
  const LAYOUT_OPTIONS: LayoutOptions = {
    ...DEFAULT_LAYOUT_OPTIONS,
    ...options,
  };

  return (
    <FeedbackInitializer>
      <SessionTimerInitializer />
      <div
        className={`app ${LAYOUT_OPTIONS.appBoxedLayout ? 'app-boxed-layout ' : ''}${
          LAYOUT_OPTIONS.appContentFullHeight ? 'app-content-full-height ' : ''
        }${LAYOUT_OPTIONS.appHeader ? '' : 'app-without-header '}${
          LAYOUT_OPTIONS.appSidebar ? '' : 'app-without-sidebar '
        }${LAYOUT_OPTIONS.appSidebarCollapsed ? 'app-sidebar-collapsed ' : ''}${
          LAYOUT_OPTIONS.appFooter ? 'app-footer-fixed ' : ''
        }${
          LAYOUT_OPTIONS.appTopNav ? 'app-with-top-nav ' : ''
        }${LAYOUT_OPTIONS.hasScroll ? 'has-scroll ' : ''}`}
        data-testid="main-layout">
        {LAYOUT_OPTIONS.appHeader && <PrivateHeader />}
        {/* LAYOUT_OPTIONS.appTopNav && (<PrivateTopNav />) */}
        {/* LAYOUT_OPTIONS.appSidebar && (<PrivateSidebar />) */}
        {LAYOUT_OPTIONS.appContent && (
          <Container className={LAYOUT_OPTIONS.appContentClass} data-testid="main-layout-content">
            <Outlet />
          </Container>
        )}
        {LAYOUT_OPTIONS.appFooter && <PrivateFooter />}
      </div>
      <SessionTimeoutModal />
    </FeedbackInitializer>
  );
};

export default MainLayout;
