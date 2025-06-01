import { screen } from '@testing-library/react';

import { createTestProviderFactory } from '@shared/utils/renderProvider';
import EmailVerificationSuccess from '@ui/pages/EmailVerificationSuccessPage';

function renderEmailVerificationSuccess() {
  const renderWithProviders = createTestProviderFactory();
  return renderWithProviders(<EmailVerificationSuccess />);
}

describe('EmailVerificationSuccess', () => {
  it('should render the title', () => {
    renderEmailVerificationSuccess();
    expect(screen.getByTestId('email-verification-success-title')).toBeInTheDocument();
  });
  it('should render the message', () => {
    renderEmailVerificationSuccess();
    expect(screen.getByTestId('email-verification-success-message')).toBeInTheDocument();
  });
  it('should render the login button', () => {
    renderEmailVerificationSuccess();
    expect(screen.getByTestId('email-verification-success-login')).toBeInTheDocument();
  });
  it('snapshot render', () => {
    const { asFragment } = renderEmailVerificationSuccess();
    expect(asFragment()).toMatchSnapshot();
  });
});
