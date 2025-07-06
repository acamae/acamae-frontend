import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import i18n from '@infrastructure/i18n';

import EmailVerificationUsedPage from '../EmailVerificationUsedPage';

describe('EmailVerificationUsedPage', () => {
  it('renderiza correctamente y muestra los textos de enlace usado', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <EmailVerificationUsedPage />
        </MemoryRouter>
      </I18nextProvider>
    );
    expect(screen.getByTestId('email-verification-used-page')).toBeInTheDocument();
    expect(screen.getByTestId('email-verification-used-title').textContent).toMatch(/utilizado/i);
    expect(screen.getByTestId('email-verification-used-message').textContent).toMatch(
      /ya fue usado/i
    );
    expect(screen.getByTestId('email-verification-used-login')).toBeInTheDocument();
  });
});
