import { screen } from '@testing-library/react';

import { createTestProviderFactory } from '@shared/utils/renderProvider';
import HomePage from '@ui/pages/HomePage';

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

  it('should render snapshot correctly', () => {
    const { asFragment } = renderHomePage();
    expect(asFragment()).toMatchSnapshot();
  });
});
