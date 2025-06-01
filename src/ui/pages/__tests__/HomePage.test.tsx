import { screen } from '@testing-library/react';

import HomePage from '@/ui/pages/HomePage';
import { createTestProviderFactory } from '@shared/utils/renderProvider';

jest.mock('@ui/components/Forms/LoginForm', () => {
  const MockLoginForm = () => <div data-testid="mock-login-form">Mocked Login Form</div>;
  return MockLoginForm;
});

function renderHomePage() {
  const renderWithProviders = createTestProviderFactory();
  return renderWithProviders(<HomePage />);
}

describe('HomePage', () => {
  it('should render the title, the description and the LoginForm in the body', () => {
    renderHomePage();
    expect(screen.getByTestId('mock-login-form')).toBeInTheDocument();
  });

  it('should render the title and the description', () => {
    renderHomePage();
    expect(screen.getByTestId('home-title')).toBeInTheDocument();
    expect(screen.getByTestId('home-description')).toBeInTheDocument();
  });

  it('snapshot render', () => {
    const { asFragment } = renderHomePage();
    expect(asFragment()).toMatchSnapshot();
  });
});
