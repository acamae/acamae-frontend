import { screen } from '@testing-library/react';

import HomePage from '@/ui/pages/HomePage';
import { createTestProviderFactory } from '@shared/utils/renderProvider';

function renderHomePage() {
  const renderWithProviders = createTestProviderFactory();
  return renderWithProviders(<HomePage />);
}

describe('HomePage', () => {
  it('should render the title and the description', () => {
    renderHomePage();
    expect(screen.getByTestId('home-page-title')).toBeInTheDocument();
    expect(screen.getByTestId('home-page-description')).toBeInTheDocument();
  });

  it('snapshot render', () => {
    const { asFragment } = renderHomePage();
    expect(asFragment()).toMatchSnapshot();
  });
});
