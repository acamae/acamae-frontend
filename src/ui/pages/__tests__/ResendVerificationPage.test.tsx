import { screen } from '@testing-library/react';

import { createTestProviderFactory } from '@shared/utils/renderProvider';
import ResendVerificationPage from '@ui/pages/ResendVerificationPage';

jest.mock('@ui/components/Forms/ResendVerificationForm', () => {
  const MockResendVerificationForm = () => (
    <div data-testid="mock-resend-verification-form">Mocked Resend Verification Form</div>
  );
  return MockResendVerificationForm;
});

function renderResendVerificationPage() {
  const renderWithProviders = createTestProviderFactory();
  return renderWithProviders(<ResendVerificationPage />);
}

describe('ResendVerificationPage', () => {
  it('should render the title', () => {
    renderResendVerificationPage();
    expect(screen.getByTestId('resend-verification-title')).toBeInTheDocument();
  });

  it('should render the form correctly', () => {
    renderResendVerificationPage();
    expect(screen.getByTestId('mock-resend-verification-form')).toBeInTheDocument();
  });

  it('should render snapshot correctly', () => {
    const { asFragment } = renderResendVerificationPage();
    expect(asFragment()).toMatchSnapshot();
  });
});
