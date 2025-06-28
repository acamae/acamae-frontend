import { render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import i18n from '@infrastructure/i18n';
import * as useEmailVerificationModule from '@ui/hooks/useEmailVerification';

import EmailVerificationPage from '../EmailVerificationPage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useSearchParams: () => [new URLSearchParams('token=abc123')],
}));

describe('EmailVerificationPage', () => {
  const navigate = jest.fn();
  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(navigate);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza el spinner mientras verifica', () => {
    jest.spyOn(useEmailVerificationModule, 'useEmailVerification').mockReturnValue({
      status: 'LOADING',
      errorCode: undefined,
      verify: jest.fn(),
    });
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <EmailVerificationPage />
        </MemoryRouter>
      </I18nextProvider>
    );
    expect(screen.getByTestId('email-verification-page')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirige según el estado', async () => {
    const verify = jest.fn();
    const cases = [
      { status: 'MISSING_TOKEN', errorCode: undefined, expected: '/verify-email-resend' },
      { status: 'SUCCESS', errorCode: undefined, expected: '/verify-email-success' },
      { status: 'ERROR', errorCode: 'AUTH_TOKEN_EXPIRED', expected: '/verify-email-expired' },
      { status: 'ERROR', errorCode: 'AUTH_TOKEN_ALREADY_USED', expected: '/verify-email-used' },
      {
        status: 'ERROR',
        errorCode: 'AUTH_USER_ALREADY_VERIFIED',
        expected: '/verify-email-already-verified',
      },
      { status: 'ERROR', errorCode: 'OTRO', expected: '/verify-email-error' },
    ];
    for (const c of cases) {
      jest.spyOn(useEmailVerificationModule, 'useEmailVerification').mockReturnValue({
        status: c.status as unknown as 'LOADING' | 'SUCCESS' | 'ERROR',
        errorCode: c.errorCode,
        verify,
      });
      render(
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <EmailVerificationPage />
          </MemoryRouter>
        </I18nextProvider>
      );
      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith(c.expected, { replace: true });
      });
      jest.clearAllMocks();
    }
  });
});
