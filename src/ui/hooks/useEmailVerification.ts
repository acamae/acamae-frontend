import { useCallback, useEffect, useRef, useState } from 'react';

import { VerifyEmailUseCase } from '@application/use-cases/auth/VerifyEmailUseCase';
import { ApiErrorCodes } from '@domain/constants/errorCodes';
import { AuthApiRepository } from '@infrastructure/api/AuthApiRepository';

export type EmailVerificationStatus =
  | 'IDLE'
  | 'MISSING_TOKEN'
  | 'OFFLINE'
  | 'LOADING'
  | 'SUCCESS'
  | 'ERROR';

export interface UseEmailVerificationResult {
  status: EmailVerificationStatus;
  errorCode?: string;
  verify: (token: string | null) => void;
}

/**
 * Hook que encapsula la lógica de verificación de correo.
 * Maneja timeout, offline, reintentos y mapea los diferentes códigos de error.
 */
export const useEmailVerification = (): UseEmailVerificationResult => {
  const [status, setStatus] = useState<EmailVerificationStatus>('IDLE');
  const [errorCode, setErrorCode] = useState<string | undefined>();

  // Evitamos ejecutar varias veces con useRef
  const controllerRef = useRef<AbortController | null>(null);

  const verify = useCallback((token: string | null) => {
    if (!token) {
      setStatus('MISSING_TOKEN');
      return;
    }

    if (!navigator.onLine) {
      setStatus('OFFLINE');
      return;
    }

    // Cancel previous request if any
    controllerRef.current?.abort();
    const abortController = new AbortController();
    controllerRef.current = abortController;

    const authRepository = new AuthApiRepository();
    const useCase = new VerifyEmailUseCase(authRepository);

    setStatus('LOADING');

    const timeoutId = setTimeout(() => {
      abortController.abort();
      setStatus('ERROR');
      setErrorCode(ApiErrorCodes.ETIMEDOUT);
    }, 10000); // 10s timeout

    useCase
      .execute(token)
      .then(response => {
        clearTimeout(timeoutId);
        if (response.success) {
          setStatus('SUCCESS');
          return;
        }
        // Mapear códigos
        switch (response.code) {
          case ApiErrorCodes.AUTH_TOKEN_EXPIRED:
          case ApiErrorCodes.AUTH_TOKEN_INVALID:
          case ApiErrorCodes.AUTH_TOKEN_REVOKED:
          case ApiErrorCodes.AUTH_TOKEN_MALICIOUS:
            setStatus('ERROR');
            setErrorCode(response.code);
            break;
          case ApiErrorCodes.AUTH_TOKEN_ALREADY_USED:
            setStatus('ERROR');
            setErrorCode(response.code);
            break;
          case ApiErrorCodes.AUTH_RATE_LIMIT:
          case ApiErrorCodes.SERVICE_UNAVAILABLE:
            setStatus('ERROR');
            setErrorCode(response.code);
            break;
          case ApiErrorCodes.AUTH_USER_ALREADY_VERIFIED:
            setStatus('ERROR');
            setErrorCode(response.code);
            break;
          case ApiErrorCodes.AUTH_USER_NOT_FOUND:
          case ApiErrorCodes.AUTH_USER_BLOCKED:
            setStatus('ERROR');
            setErrorCode(response.code);
            break;
          default:
            setStatus('ERROR');
            setErrorCode(response.code);
        }
      })
      .catch(error => {
        clearTimeout(timeoutId);
        if (abortController.signal.aborted) return; // ya gestionado

        // Podríamos inspeccionar error.code o error.message
        setStatus('ERROR');
        setErrorCode(error?.code ?? ApiErrorCodes.UNKNOWN_ERROR);
      });
  }, []);

  // Listener para volver a intentar cuando regrese la conexión
  useEffect(() => {
    const onOnline = () => {
      if (status === 'OFFLINE') {
        setStatus('IDLE');
      }
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [status]);

  return { status, errorCode, verify };
};
