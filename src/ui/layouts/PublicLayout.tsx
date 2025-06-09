import React from 'react';
import { Outlet } from 'react-router-dom';

import { LayoutOptions } from '@domain/types/layoutOptions';
import { DEFAULT_LAYOUT_OPTIONS } from '@shared/constants/layoutOptions';
import PublicHeader from '@ui/components/PublicHeader';

interface PublicLayoutProps {
  options?: Partial<LayoutOptions>;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ options = {} }) => {
  const LAYOUT_OPTIONS = {
    ...DEFAULT_LAYOUT_OPTIONS,
    ...options,
  };

  return (
    <div
      className={
        'app ' +
        (LAYOUT_OPTIONS.appBoxedLayout ? 'app-boxed-layout ' : '') +
        (LAYOUT_OPTIONS.appContentFullHeight ? 'app-content-full-height ' : '') +
        (LAYOUT_OPTIONS.appHeader ? '' : 'app-without-header ') +
        (LAYOUT_OPTIONS.appSidebar ? '' : 'app-without-sidebar ') +
        (LAYOUT_OPTIONS.appSidebarCollapsed ? 'app-sidebar-collapsed ' : '') +
        (LAYOUT_OPTIONS.appFooter ? 'app-footer-fixed ' : '') +
        (LAYOUT_OPTIONS.appTopNav ? 'app-with-top-nav ' : '') +
        (LAYOUT_OPTIONS.hasScroll ? 'has-scroll ' : '')
      }
      data-testid="public-layout">
      {LAYOUT_OPTIONS.appHeader && <PublicHeader />}
      {/* LAYOUT_OPTIONS.appTopNav && (<PublicTopNav />) */}
      {/* LAYOUT_OPTIONS.appSidebar && (<PublicSidebar />) */}
      {LAYOUT_OPTIONS.appContent && (
        <div className={LAYOUT_OPTIONS.appContentClass} data-testid="public-layout-content">
          <Outlet />
        </div>
      )}
      {/* LAYOUT_OPTIONS.appFooter && (<PublicFooter />) */}
    </div>
  );
};

export default PublicLayout;
