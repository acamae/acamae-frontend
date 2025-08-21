import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ResetPasswordSuccessPage from '../ResetPasswordSuccessPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

describe('ResetPasswordSuccessPage', () => {
  it('renders title, message and login link', () => {
    render(
      <MemoryRouter>
        <ResetPasswordSuccessPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('reset-password-success-page')).toBeInTheDocument();
    expect(screen.getByTestId('reset-password-success-title')).toHaveTextContent(
      'reset.success.title'
    );
    expect(screen.getByTestId('reset-password-success-message')).toBeInTheDocument();
    expect(screen.getByTestId('reset-password-success-login')).toBeInTheDocument();
  });
});
