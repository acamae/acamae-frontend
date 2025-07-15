import { screen } from '@testing-library/react';

import { createTestProviderFactory } from '@shared/utils/renderProvider';
import EmailVerificationResendPage from '@ui/pages/EmailVerificationResendPage';

jest.mock('@ui/components/Forms/ResendVerificationForm', () => {
  const MockResendVerificationForm = () => (
    <div data-testid="mock-email-verification-resend-form">Mocked Resend Verification Form</div>
  );
  return MockResendVerificationForm;
});

function renderEmailVerificationResendPage() {
  const renderWithProviders = createTestProviderFactory();
  return renderWithProviders(<EmailVerificationResendPage />);
}

describe('EmailVerificationResendPage', () => {
  it('should render the title', () => {
    renderEmailVerificationResendPage();
    expect(screen.getByTestId('email-verification-resend-title')).toBeInTheDocument();
  });

  it('should render the form correctly', () => {
    renderEmailVerificationResendPage();
    expect(screen.getByTestId('mock-email-verification-resend-form')).toBeInTheDocument();
  });

  it('should render snapshot correctly', () => {
    const { asFragment } = renderEmailVerificationResendPage();
    expect(asFragment()).toMatchSnapshot();
  });
});
