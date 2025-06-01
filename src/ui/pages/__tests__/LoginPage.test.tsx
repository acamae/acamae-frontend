import { screen } from '@testing-library/react';

import { createTestProviderFactory } from '@shared/utils/renderProvider';
import LoginPage from '@ui/pages/LoginPage';

jest.mock('@ui/components/Forms/LoginForm', () => {
  const MockLoginForm = () => <div data-testid="mock-login-form">Mocked Login Form</div>;
  return MockLoginForm;
});

function renderLoginPage() {
  const renderWithProviders = createTestProviderFactory();
  return renderWithProviders(<LoginPage />);
}

describe('LoginPage', () => {
  it('should render the title and the LoginForm', () => {
    renderLoginPage();
    expect(screen.getByTestId('mock-login-form')).toBeInTheDocument();
  });

  it('should render the title', () => {
    renderLoginPage();
    expect(screen.getByTestId('login-title')).toBeInTheDocument();
  });

  it('snapshot render', () => {
    const { asFragment } = renderLoginPage();
    expect(asFragment()).toMatchSnapshot();
  });
});
