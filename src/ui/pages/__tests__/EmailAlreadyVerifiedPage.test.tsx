import { screen, within } from '@testing-library/react';

import i18n from '@infrastructure/i18n';
import { createTestProviderFactory } from '@shared/utils/renderProvider';
import EmailAlreadyVerified from '@ui/pages/EmailAlreadyVerifiedPage';

function renderEmailAlreadyVerifiedPage() {
  const renderWithProviders = createTestProviderFactory();
  return renderWithProviders(<EmailAlreadyVerified />);
}

describe('EmailAlreadyVerified', () => {
  it('should render the title and the message', () => {
    renderEmailAlreadyVerifiedPage();

    const alert = screen.getByTestId('email-already-verified-page');
    expect(within(alert).getByText(i18n.t('verification.already.title'))).toBeInTheDocument();
    expect(within(alert).getByText(i18n.t('verification.already.message'))).toBeInTheDocument();
    expect(within(alert).getByTestId('link-back-home')).toBeInTheDocument();
  });
});
