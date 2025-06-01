import { screen } from '@testing-library/react';

import i18n from '@infrastructure/i18n';
import { createTestProviderFactory } from '@shared/utils/renderProvider';
import NotFoundPage from '@ui/pages/NotFoundPage';

function renderNotFoundPage() {
  const renderWithProviders = createTestProviderFactory();
  return renderWithProviders(<NotFoundPage />);
}

describe('NotFoundPage', () => {
  it('should render the title, the message and the link', () => {
    renderNotFoundPage();
    expect(screen.getByTestId('not-found-title')).toHaveTextContent(i18n.t('not_found.title'));
    expect(screen.getByTestId('not-found-message')).toHaveTextContent(i18n.t('not_found.message'));
    expect(screen.getByTestId('link-back-home')).toHaveTextContent(i18n.t('not_found.backHome'));
  });

  it('snapshot render', () => {
    const { asFragment } = renderNotFoundPage();
    expect(asFragment()).toMatchSnapshot();
  });
});
