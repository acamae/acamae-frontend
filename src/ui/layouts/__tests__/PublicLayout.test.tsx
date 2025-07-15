import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { DEFAULT_LAYOUT_OPTIONS } from '@shared/constants/layoutOptions';
import { createTestProviderFactory } from '@shared/utils/renderProvider';
import PublicLayout from '@ui/layouts/PublicLayout';

// Mock FeedbackInitializer
jest.mock('@ui/components/FeedbackInitializer', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const renderWithProviders = createTestProviderFactory();

describe('PublicLayout', () => {
  it('should render the PublicLayout with default configuration', () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<div>Public Layout</div>} />
        </Route>
      </Routes>,
      { route: '/' }
    );

    // Verificar que los componentes principales están presentes
    expect(screen.getByText('Public Layout')).toBeInTheDocument();
    expect(screen.getByTestId('public-header')).toBeInTheDocument();

    // Verificar las clases CSS por defecto
    const appContainer = screen.getByTestId('public-layout');
    expect(appContainer).not.toHaveClass('app-content-full-height');
    expect(appContainer).not.toHaveClass('app-boxed-layout');
    expect(appContainer).not.toHaveClass('app-without-header');
    expect(appContainer).toHaveClass('app-without-sidebar');
    expect(appContainer).not.toHaveClass('app-sidebar-collapsed');
    expect(appContainer).toHaveClass('app-footer-fixed');
    expect(appContainer).not.toHaveClass('app-with-top-nav');
    expect(appContainer).not.toHaveClass('has-scroll');
  });

  it('should render without header when appHeader is false', () => {
    const customOptions = {
      ...DEFAULT_LAYOUT_OPTIONS,
      appHeader: false,
      appContent: true,
      appContentClass: 'app-content',
    };

    renderWithProviders(
      <Routes>
        <Route path="/" element={<PublicLayout options={customOptions} />}>
          <Route index element={<div>Public Layout</div>} />
        </Route>
      </Routes>,
      { route: '/' }
    );

    expect(screen.queryByTestId('public-header')).not.toBeInTheDocument();
    const appContainer = screen.getByTestId('public-layout');
    expect(appContainer).toHaveClass('app-without-header');
  });

  it('should render without content when appContent is false', () => {
    const customOptions = {
      ...DEFAULT_LAYOUT_OPTIONS,
      appHeader: true,
      appContent: false,
    };

    renderWithProviders(
      <Routes>
        <Route path="/" element={<PublicLayout options={customOptions} />}>
          <Route index element={<div>Public Layout</div>} />
        </Route>
      </Routes>,
      { route: '/' }
    );

    expect(screen.queryByText('Public Layout')).not.toBeInTheDocument();
  });

  it('should apply custom content class when provided', () => {
    const customClass = 'custom-content-class';
    const customOptions = {
      ...DEFAULT_LAYOUT_OPTIONS,
      appHeader: true,
      appContent: true,
      appContentClass: customClass,
    };

    renderWithProviders(
      <Routes>
        <Route path="/" element={<PublicLayout options={customOptions} />}>
          <Route index element={<div>Public Layout</div>} />
        </Route>
      </Routes>,
      { route: '/' }
    );

    expect(screen.getByTestId('public-layout-content')).toHaveClass(customClass);
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
        <Route path="/" element={<PublicLayout options={customOptions} />}>
          <Route index element={<div>Public Layout</div>} />
        </Route>
      </Routes>,
      { route: '/' }
    );

    const appContainer = screen.getByTestId('public-layout');
    expect(appContainer).toHaveClass('app-boxed-layout');
    expect(appContainer).toHaveClass('app-content-full-height');
    expect(appContainer).not.toHaveClass('app-without-header');
    expect(appContainer).not.toHaveClass('app-without-sidebar');
    expect(appContainer).toHaveClass('app-sidebar-collapsed');
    expect(appContainer).toHaveClass('app-footer-fixed');
    expect(appContainer).toHaveClass('app-with-top-nav');
    expect(appContainer).toHaveClass('has-scroll');
  });

  it('no renderiza el header si appHeader es false (branch explícito)', () => {
    const customOptions = { ...DEFAULT_LAYOUT_OPTIONS, appHeader: false };
    renderWithProviders(
      <Routes>
        <Route path="/" element={<PublicLayout options={customOptions} />}>
          <Route index element={<div>Public Layout</div>} />
        </Route>
      </Routes>,
      { route: '/' }
    );
    expect(screen.queryByTestId('public-header')).not.toBeInTheDocument();
  });
});
