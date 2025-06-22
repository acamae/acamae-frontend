import { screen, within } from '@testing-library/react';

import i18n from '@infrastructure/i18n';
import { createTestProviderFactory } from '@shared/utils/renderProvider';
import EmailVerificationExpired from '@ui/pages/EmailVerificationExpiredPage';

function renderEmailVerificationExpired() {
  const renderWithProviders = createTestProviderFactory();
  return renderWithProviders(<EmailVerificationExpired />);
}

describe('EmailVerificationExpired', () => {
  it('should render the title and the message', () => {
    renderEmailVerificationExpired();

    const alert = screen.getByTestId('email-verification-expired-page');
    expect(within(alert).getByText(i18n.t('verification.expired.title'))).toBeInTheDocument();
    expect(within(alert).getByText(i18n.t('verification.expired.message'))).toBeInTheDocument();
    expect(within(alert).getByTestId('email-verification-expired-resend')).toBeInTheDocument();
  });
});
