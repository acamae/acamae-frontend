import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { APP_ROUTES } from '@shared/constants/appRoutes';
import { DEFAULT_LAYOUT_OPTIONS } from '@shared/constants/layoutOptions';
import { createTestProviderFactory } from '@shared/utils/renderProvider';
import MainLayout from '@ui/layouts/MainLayout';

const renderWithProviders = createTestProviderFactory();

describe('MainLayout', () => {
  it('should render the MainLayout with default configuration', () => {
    renderWithProviders(
      <Routes>
        <Route path={APP_ROUTES.DASHBOARD} element={<MainLayout />}>
          <Route index element={<div>Main Layout</div>} />
        </Route>
      </Routes>,
      { route: APP_ROUTES.DASHBOARD }
    );

    // Verificar que los componentes principales están presentes
    expect(screen.getByText('Main Layout')).toBeInTheDocument();
    expect(screen.getByTestId('private-header')).toBeInTheDocument();

    // Verificar las clases CSS por defecto
    const appContainer = screen.getByTestId('main-layout');
    expect(appContainer).not.toHaveClass('app-with-top-nav');
    expect(appContainer).not.toHaveClass('app-content-full-height');
    expect(appContainer).not.toHaveClass('app-boxed-layout');
    expect(appContainer).not.toHaveClass('app-without-header');
    expect(appContainer).toHaveClass('app-without-sidebar');
    expect(appContainer).not.toHaveClass('app-sidebar-collapsed');
    expect(appContainer).toHaveClass('app-footer-fixed');
    expect(appContainer).not.toHaveClass('has-scroll');
  });

  it('should render without header when appHeader is false', () => {
    const customOptions = {
      ...DEFAULT_LAYOUT_OPTIONS,
      appHeader: false,
      appTopNav: true,
      appContent: true,
      appContentClass: 'app-content p-0',
    };

    renderWithProviders(
      <Routes>
        <Route path={APP_ROUTES.DASHBOARD} element={<MainLayout options={customOptions} />}>
          <Route index element={<div>Main Layout</div>} />
        </Route>
      </Routes>,
      { route: APP_ROUTES.DASHBOARD }
    );

    expect(screen.queryByTestId('private-header')).not.toBeInTheDocument();
    const appContainer = screen.getByTestId('main-layout');
    expect(appContainer).toHaveClass('app-without-header');
    expect(appContainer).toHaveClass('app-with-top-nav');
  });

  it('should render without content when appContent is false', () => {
    const customOptions = {
      ...DEFAULT_LAYOUT_OPTIONS,
      appHeader: true,
      appTopNav: true,
      appContent: false,
    };

    renderWithProviders(
      <Routes>
        <Route path={APP_ROUTES.DASHBOARD} element={<MainLayout options={customOptions} />}>
          <Route index element={<div>Main Layout</div>} />
        </Route>
      </Routes>,
      { route: APP_ROUTES.DASHBOARD }
    );

    expect(screen.queryByText('Main Layout')).not.toBeInTheDocument();
    const appContainer = screen.getByTestId('main-layout');
    expect(appContainer).toHaveClass('app-with-top-nav');
    expect(appContainer).not.toHaveClass('app-content-full-height');
    expect(appContainer).not.toHaveClass('app-boxed-layout');
    expect(appContainer).not.toHaveClass('app-without-header');
    expect(appContainer).toHaveClass('app-without-sidebar');
    expect(appContainer).not.toHaveClass('app-sidebar-collapsed');
    expect(appContainer).toHaveClass('app-footer-fixed');
    expect(appContainer).not.toHaveClass('has-scroll');
  });

  it('should apply custom content class when provided', () => {
    const customClass = 'custom-content-class';
    const customOptions = {
      ...DEFAULT_LAYOUT_OPTIONS,
      appHeader: true,
      appTopNav: true,
      appContent: true,
      appContentClass: customClass,
    };

    renderWithProviders(
      <Routes>
        <Route path={APP_ROUTES.DASHBOARD} element={<MainLayout options={customOptions} />}>
          <Route index element={<div>Main Layout</div>} />
        </Route>
      </Routes>,
      { route: APP_ROUTES.DASHBOARD }
    );

    expect(screen.getByTestId('main-layout-content')).toHaveClass(customClass);
  });

  it('should apply all layout options when enabled', () => {
    const customOptions = {
      ...DEFAULT_LAYOUT_OPTIONS,
      appBoxedLayout: true,
      appContentFullHeight: true,
      appHeader: true,
      appSidebar: true,
      appSidebarCollapsed: true,
      appFooter: true,
      appTopNav: true,
      hasScroll: true,
    };

    renderWithProviders(
      <Routes>
        <Route path={APP_ROUTES.DASHBOARD} element={<MainLayout options={customOptions} />}>
          <Route index element={<div>Main Layout</div>} />
        </Route>
      </Routes>,
      { route: APP_ROUTES.DASHBOARD }
    );

    const appContainer = screen.getByTestId('main-layout');
    expect(appContainer).toHaveClass('app-boxed-layout');
    expect(appContainer).toHaveClass('app-content-full-height');
    expect(appContainer).not.toHaveClass('app-without-header');
    expect(appContainer).not.toHaveClass('app-without-sidebar');
    expect(appContainer).toHaveClass('app-sidebar-collapsed');
    expect(appContainer).toHaveClass('app-footer-fixed');
    expect(appContainer).toHaveClass('app-with-top-nav');
    expect(appContainer).toHaveClass('has-scroll');
  });
});
