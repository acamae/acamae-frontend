import { screen } from '@testing-library/react';

import i18n from '@infrastructure/i18n';
import { createTestProviderFactory } from '@shared/utils/renderProvider';
import RegisterPage from '@ui/pages/RegisterPage';

jest.mock('@ui/components/Forms/RegisterForm', () => {
  const MockRegisterForm = () => <div data-testid="mock-register-form">Mocked Register Form</div>;
  return MockRegisterForm;
});

function renderRegisterPage() {
  const renderWithProviders = createTestProviderFactory();
  return renderWithProviders(<RegisterPage />);
}

describe('RegisterPage', () => {
  it('should render the title', () => {
    renderRegisterPage();
    expect(screen.getByTestId('register-title')).toHaveTextContent(i18n.t('register.title'));
  });

  it('should render the form', () => {
    renderRegisterPage();
    expect(screen.getByTestId('mock-register-form')).toBeInTheDocument();
  });

  it('snapshot render', () => {
    const { asFragment } = renderRegisterPage();
    expect(asFragment()).toMatchSnapshot();
  });
});
