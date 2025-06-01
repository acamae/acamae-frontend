import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { createTestProviderFactory } from '@shared/utils/renderProvider';
import PublicLayout from '@ui/layouts/PublicLayout';

const renderWithProviders = createTestProviderFactory();

describe('PublicLayout', () => {
  it('should render the PublicLayout and its children via Outlet', () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<div>Public Layout</div>} />
        </Route>
      </Routes>,
      { route: '/' }
    );
    expect(screen.getByText('Public Layout')).toBeInTheDocument();
  });
});
