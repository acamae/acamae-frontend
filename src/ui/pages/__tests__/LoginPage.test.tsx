import { screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { createTestProviderFactory } from '@shared/utils/renderProvider';
import LoginPage from '@ui/pages/LoginPage';

jest.mock('@ui/components/Forms/LoginForm', () => {
  const MockLoginForm = () => <div data-testid="mock-login-form">Mocked Login Form</div>;
  return MockLoginForm;
});

function renderLoginPage() {
  const renderWithProviders = createTestProviderFactory();
  return renderWithProviders(<LoginPage />);
}

describe('LoginPage', () => {
  it('should render the title and the LoginForm', async () => {
    await act(async () => {
      renderLoginPage();
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-login-form')).toBeInTheDocument();
    });
  });

  it('should render the title', async () => {
    await act(async () => {
      renderLoginPage();
    });

    await waitFor(() => {
      expect(screen.getByTestId('login-page-title')).toBeInTheDocument();
      expect(screen.getByTestId('login-page-description')).toBeInTheDocument();
    });
  });

  it('should render snapshot correctly', async () => {
    let result: ReturnType<typeof renderLoginPage>;
    await act(async () => {
      result = renderLoginPage();
    });

    await waitFor(() => {
      expect(result!.asFragment()).toMatchSnapshot();
    });
  });
});
