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

  it('should render snapshot correctly', () => {
    const { asFragment } = renderResetPasswordPage();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should not render when route does not match', () => {
    const renderWithProviders = createTestProviderFactory();
    const { container } = renderWithProviders(
      <Routes>
        <Route path="/restablecer-clave" element={<ResetPasswordPage />} />
      </Routes>,
      {
        route: '/otra-ruta',
      }
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render with empty token', () => {
    renderResetPasswordPage({ token: '' });
    expect(screen.getByTestId('reset-password-title')).toBeInTheDocument();
  });
});
