import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import i18n from '@infrastructure/i18n';

import EmailVerificationErrorPage from '../EmailVerificationErrorPage';

describe('EmailVerificationErrorPage', () => {
  it('renderiza correctamente y muestra los textos de error', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <EmailVerificationErrorPage />
        </MemoryRouter>
      </I18nextProvider>
    );
    expect(screen.getByTestId('email-verification-error-page')).toBeInTheDocument();
    expect(screen.getByTestId('email-verification-error-title').textContent).toMatch(/error/i);
    expect(screen.getByTestId('email-verification-error-message').textContent).toMatch(
      /no se pudo verificar/i
    );
    expect(screen.getByTestId('email-verification-error-back-home')).toBeInTheDocument();
  });
});
