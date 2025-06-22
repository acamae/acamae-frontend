import { screen, within } from '@testing-library/react';

import i18n from '@infrastructure/i18n';
import { createTestProviderFactory } from '@shared/utils/renderProvider';
import EmailVerificationSentPage from '@ui/pages/EmailVerificationSentPage';

function renderEmailVerificationSentPage() {
  const renderWithProviders = createTestProviderFactory();
  return renderWithProviders(<EmailVerificationSentPage />);
}

describe('EmailVerificationSentPage', () => {
  it('should render the title and the message', () => {
    renderEmailVerificationSentPage();

    const alert = screen.getByTestId('email-verification-sent-page');
    expect(within(alert).getByText(i18n.t('verification.sent.title'))).toBeInTheDocument();
    expect(within(alert).getByText(i18n.t('verification.sent.message'))).toBeInTheDocument();
    expect(within(alert).getByTestId('email-verification-sent-back-home')).toBeInTheDocument();
  });
});
