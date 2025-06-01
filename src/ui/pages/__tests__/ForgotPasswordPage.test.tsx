import { screen } from '@testing-library/react';

import { createTestProviderFactory } from '@shared/utils/renderProvider';
import ForgotPasswordPage from '@ui/pages/ForgotPasswordPage';

jest.mock('@ui/components/Forms/ForgotPasswordForm', () => {
  const MockForgotPasswordForm = () => (
    <div data-testid="mock-forgot-password-form">Mocked Forgot Password Form</div>
  );
  return MockForgotPasswordForm;
});

function renderForgotPasswordPage() {
  const renderWithProviders = createTestProviderFactory();
  return renderWithProviders(<ForgotPasswordPage />);
}

describe('ForgotPasswordPage', () => {
  it('should render the title and the form', () => {
    renderForgotPasswordPage();
    expect(screen.getByTestId('mock-forgot-password-form')).toBeInTheDocument();
  });

  it('should render the title', () => {
    renderForgotPasswordPage();
    expect(screen.getByTestId('forgot-password-title')).toBeInTheDocument();
  });
});
