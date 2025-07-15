import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import i18n from '@infrastructure/i18n';

import EmailVerificationErrorPage from '../EmailVerificationErrorPage';

describe('EmailVerificationErrorPage', () => {
  it('renderiza correctamente y muestra los textos de error específicos', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <EmailVerificationErrorPage />
        </MemoryRouter>
      </I18nextProvider>
    );

    expect(screen.getByTestId('email-verification-error-page')).toBeInTheDocument();
    expect(screen.getByTestId('email-verification-error-title')).toBeInTheDocument();
    expect(screen.getByTestId('email-verification-error-message')).toBeInTheDocument();
    expect(screen.getByTestId('email-verification-error-resend')).toBeInTheDocument();
    expect(screen.getByTestId('email-verification-error-back-home')).toBeInTheDocument();

    // Verificar que se muestran los nuevos elementos específicos
    expect(
      screen.getByText(/enlace de verificación que has usado no es válido/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/enlace está malformado o corrupto/i)).toBeInTheDocument();
    expect(screen.getByText(/enlace ha expirado/i)).toBeInTheDocument();
    expect(screen.getByText(/enlace ya fue utilizado anteriormente/i)).toBeInTheDocument();
    expect(screen.getByText(/enlace no corresponde a tu cuenta/i)).toBeInTheDocument();
    expect(screen.getByText(/para solucionarlo/i)).toBeInTheDocument();
    expect(screen.getByText(/solicita un nuevo enlace de verificación/i)).toBeInTheDocument();
  });
});
