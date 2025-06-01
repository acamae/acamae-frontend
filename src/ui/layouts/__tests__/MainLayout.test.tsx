import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { createTestProviderFactory } from '@shared/utils/renderProvider';
import MainLayout from '@ui/layouts/MainLayout';

const renderWithProviders = createTestProviderFactory();

describe('MainLayout', () => {
  it('should render the MainLayout', () => {
    renderWithProviders(
      <Routes>
        <Route path="/dashboard" element={<MainLayout />}>
          <Route index element={<div>Main Layout</div>} />
        </Route>
      </Routes>,
      { route: '/dashboard' }
    );
    expect(screen.getByText('Main Layout')).toBeInTheDocument();
  });
});
