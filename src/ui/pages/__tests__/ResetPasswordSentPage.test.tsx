import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ResetPasswordSentPage from '../ResetPasswordSentPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

describe('ResetPasswordSentPage', () => {
  it('renders title, message and back link', () => {
    render(
      <MemoryRouter>
        <ResetPasswordSentPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('reset-password-sent-page')).toBeInTheDocument();
    expect(screen.getByTestId('reset-password-sent-title')).toHaveTextContent(
      'reset.email_sent_title'
    );
    expect(screen.getByTestId('reset-password-sent-message')).toBeInTheDocument();
    expect(screen.getByTestId('reset-password-sent-back-home')).toBeInTheDocument();
  });
});
