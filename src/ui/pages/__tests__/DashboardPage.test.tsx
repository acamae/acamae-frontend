import { screen } from '@testing-library/react';

import i18n from '@infrastructure/i18n';
import { createTestProviderFactory } from '@shared/utils/renderProvider';
import DashboardPage from '@ui/pages/DashboardPage';

function renderDashboardPage() {
  const renderWithProviders = createTestProviderFactory();
  return renderWithProviders(<DashboardPage />);
}

describe('DashboardPage', () => {
  it('should render the title and welcome message', () => {
    renderDashboardPage();

    expect(screen.getByTestId('dashboard-title')).toHaveTextContent(i18n.t('dashboard.title'));
    expect(screen.getByTestId('dashboard-welcome')).toHaveTextContent(
      i18n.t('dashboard.welcome_message')
    );
  });
});
