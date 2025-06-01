import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';

import { createTestProviderFactory } from '@shared/utils/renderProvider';
import ResetPasswordPage from '@ui/pages/ResetPasswordPage';

jest.mock('@ui/components/Forms/ResetPasswordForm', () => {
  const MockResetPasswordForm = () => (
    <div data-testid="mock-reset-password-form">Mocked Reset Password Form</div>
  );
  return MockResetPasswordForm;
});

function renderResetPasswordPage({ token = 'mock-token' }: { token?: string } = {}) {
  const renderWithProviders = createTestProviderFactory();
  return renderWithProviders(
    <Routes>
      <Route path="/restablecer-clave" element={<ResetPasswordPage />} />
    </Routes>,
    {
      route: `/restablecer-clave?${token ? `token=${token}` : ''}`,
    }
  );
}

describe('ResetPasswordPage', () => {
  it('should render the title', () => {
    renderResetPasswordPage();
    expect(screen.getByTestId('reset-password-title')).toBeInTheDocument();
  });

  it('snapshot render', () => {
    const { asFragment } = renderResetPasswordPage();
    expect(asFragment()).toMatchSnapshot();
  });
});
