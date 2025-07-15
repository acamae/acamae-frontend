import { renderHook, act } from '@testing-library/react';

import * as errorCodes from '@domain/constants/errorCodes';
import * as api from '@infrastructure/api/AuthApiRepository';
import { AuthApiRepository } from '@infrastructure/api/AuthApiRepository';
import { useEmailVerification } from '@ui/hooks/useEmailVerification';

describe('useEmailVerification', () => {
  let verifyEmailMock: jest.SpyInstance;
  beforeEach(() => {
    verifyEmailMock = jest.spyOn(api, 'AuthApiRepository').mockImplementation(
      () =>
        ({
          verifyEmail: jest.fn(),
        }) as unknown as jest.Mocked<AuthApiRepository>
    );
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debe poner MISSING_TOKEN si no hay token', () => {
    const { result } = renderHook(() => useEmailVerification());
    act(() => {
      result.current.verify(null);
    });
    expect(result.current.status).toBe('MISSING_TOKEN');
  });

  it('debe poner OFFLINE si navigator.onLine es false', () => {
    jest.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
    const { result } = renderHook(() => useEmailVerification());
    act(() => {
      result.current.verify('token');
    });
    expect(result.current.status).toBe('OFFLINE');
  });

  it('debe poner SUCCESS si verifyEmail devuelve success', async () => {
    verifyEmailMock.mockImplementation(
      () =>
        ({
          verifyEmail: jest.fn().mockResolvedValue({ success: true }),
        }) as unknown
    );
    const { result } = renderHook(() => useEmailVerification());
    await act(async () => {
      result.current.verify('token');
    });
    expect(result.current.status).toBe('SUCCESS');
  });

  it('debe mapear errores y estados correctamente', async () => {
    const codes = [
      errorCodes.ApiErrorCodes.AUTH_TOKEN_EXPIRED,
      errorCodes.ApiErrorCodes.AUTH_TOKEN_INVALID,
      errorCodes.ApiErrorCodes.AUTH_TOKEN_REVOKED,
      errorCodes.ApiErrorCodes.AUTH_TOKEN_MALICIOUS,
      errorCodes.ApiErrorCodes.AUTH_TOKEN_ALREADY_USED,
      errorCodes.ApiErrorCodes.AUTH_RATE_LIMIT,
      errorCodes.ApiErrorCodes.SERVICE_UNAVAILABLE,
      errorCodes.ApiErrorCodes.AUTH_USER_ALREADY_VERIFIED,
      errorCodes.ApiErrorCodes.AUTH_USER_NOT_FOUND,
      errorCodes.ApiErrorCodes.AUTH_USER_BLOCKED,
      errorCodes.ApiErrorCodes.INVALID_REFRESH_TOKEN,
      errorCodes.ApiErrorCodes.EMAIL_NOT_VERIFIED,
      errorCodes.ApiErrorCodes.DATABASE_ERROR,
      'OTRO',
    ];
    for (const code of codes) {
      verifyEmailMock.mockImplementation(
        () =>
          ({
            verifyEmail: jest.fn().mockResolvedValue({ success: false, code }),
          }) as unknown
      );
      const { result } = renderHook(() => useEmailVerification());
      await act(async () => {
        result.current.verify('token');
      });
      expect(result.current.status).toBe('ERROR');
      expect(result.current.errorCode).toBe(code);
    }
  });

  it('debe manejar timeout', async () => {
    jest.useFakeTimers();
    const mockVerifyEmail = jest.fn(() => new Promise(() => {}));
    verifyEmailMock.mockImplementation(
      () =>
        ({
          verifyEmail: mockVerifyEmail,
        }) as unknown
    );
    const { result } = renderHook(() => useEmailVerification());
    act(() => {
      result.current.verify('token');
      jest.advanceTimersByTime(10001);
    });
    expect(result.current.status).toBe('ERROR');
    expect(result.current.errorCode).toBe(errorCodes.ApiErrorCodes.ETIMEDOUT);
    jest.useRealTimers();
  });

  it('no cambia estado si el error es por abort (signal.aborted)', async () => {
    // Simula verifyEmail que rechaza y el abortController está aborted
    const mockVerifyEmail = jest.fn(() => Promise.reject(new Error('IGNORED')));
    verifyEmailMock.mockImplementation(
      () =>
        ({
          verifyEmail: mockVerifyEmail,
        }) as unknown
    );
    const { result } = renderHook(() => useEmailVerification());
    // Simula el abortController
    const origAbortController = window.AbortController;
    let aborted = false;
    // Mock abortController para controlar el flag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).AbortController = function () {
      this.signal = {
        get aborted() {
          return aborted;
        },
      };
      this.abort = () => {
        aborted = true;
      };
    };
    await act(async () => {
      result.current.verify('token');
      // Forzar el abort manualmente
      aborted = true;
      // Llamar verify de nuevo para disparar el catch con aborted
      result.current.verify('token');
    });
    // El estado no debe cambiar a ERROR porque fue abortado
    expect(result.current.status).not.toBe('ERROR');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).AbortController = origAbortController;
  });

  it('debe asignar UNKNOWN_ERROR si el error no tiene code', async () => {
    const mockVerifyEmail = jest.fn();
    verifyEmailMock = jest.spyOn(api, 'AuthApiRepository').mockImplementation(
      () =>
        ({
          verifyEmail: mockVerifyEmail,
        }) as unknown as jest.Mocked<AuthApiRepository>
    );
    const { result } = renderHook(() => useEmailVerification());
    await act(async () => {
      result.current.verify('token');
    });
    expect(result.current.status).toBe('ERROR');
    expect(result.current.errorCode).toBe(errorCodes.ApiErrorCodes.UNKNOWN_ERROR);
  });

  it('debe volver a IDLE cuando vuelve online desde OFFLINE', () => {
    // 1. Forzar offline
    jest.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
    const { result } = renderHook(() => useEmailVerification());
    act(() => {
      result.current.verify('token');
    });
    expect(result.current.status).toBe('OFFLINE');

    // 2. Simular reconexión
    jest.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(true);
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.status).toBe('IDLE');
  });

  it('debe abortar la petición anterior si se llama verify dos veces', async () => {
    let abortCalled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const abortControllerMock = function (this: any) {
      this.signal = { aborted: false };
      this.abort = () => {
        abortCalled = true;
      };
    };
    const origAbortController = window.AbortController;
    (window as any).AbortController = abortControllerMock; // eslint-disable-line @typescript-eslint/no-explicit-any
    const mockVerifyEmail = jest.fn(() => Promise.resolve({ success: true }));
    verifyEmailMock.mockImplementation(
      () =>
        ({
          verifyEmail: mockVerifyEmail,
        }) as unknown
    );
    const { result } = renderHook(() => useEmailVerification());
    await act(async () => {
      result.current.verify('token1');
      result.current.verify('token2');
    });
    expect(abortCalled).toBe(true);
    (window as any).AbortController = origAbortController; // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  it('debe manejar INVALID_REFRESH_TOKEN correctamente', async () => {
    const mockVerifyEmail = jest.fn().mockResolvedValue({
      success: false,
      code: errorCodes.ApiErrorCodes.INVALID_REFRESH_TOKEN,
    });
    verifyEmailMock.mockImplementation(
      () =>
        ({
          verifyEmail: mockVerifyEmail,
        }) as unknown
    );
    const { result } = renderHook(() => useEmailVerification());
    await act(async () => {
      result.current.verify('token');
    });
    expect(result.current.status).toBe('ERROR');
    expect(result.current.errorCode).toBe(errorCodes.ApiErrorCodes.INVALID_REFRESH_TOKEN);
  });

  it('debe manejar EMAIL_NOT_VERIFIED correctamente', async () => {
    const mockVerifyEmail = jest.fn().mockResolvedValue({
      success: false,
      code: errorCodes.ApiErrorCodes.EMAIL_NOT_VERIFIED,
    });
    verifyEmailMock.mockImplementation(
      () =>
        ({
          verifyEmail: mockVerifyEmail,
        }) as unknown
    );
    const { result } = renderHook(() => useEmailVerification());
    await act(async () => {
      result.current.verify('token');
    });
    expect(result.current.status).toBe('ERROR');
    expect(result.current.errorCode).toBe(errorCodes.ApiErrorCodes.EMAIL_NOT_VERIFIED);
  });

  it('debe manejar DATABASE_ERROR correctamente', async () => {
    const mockVerifyEmail = jest.fn().mockResolvedValue({
      success: false,
      code: errorCodes.ApiErrorCodes.DATABASE_ERROR,
    });
    verifyEmailMock.mockImplementation(
      () =>
        ({
          verifyEmail: mockVerifyEmail,
        }) as unknown
    );
    const { result } = renderHook(() => useEmailVerification());
    await act(async () => {
      result.current.verify('token');
    });
    expect(result.current.status).toBe('ERROR');
    expect(result.current.errorCode).toBe(errorCodes.ApiErrorCodes.DATABASE_ERROR);
  });

  it('debe manejar múltiples códigos de error en secuencia', async () => {
    const errorCodesToTest = [
      errorCodes.ApiErrorCodes.INVALID_REFRESH_TOKEN,
      errorCodes.ApiErrorCodes.EMAIL_NOT_VERIFIED,
      errorCodes.ApiErrorCodes.DATABASE_ERROR,
    ];

    for (const code of errorCodesToTest) {
      const mockVerifyEmail = jest.fn().mockResolvedValue({
        success: false,
        code,
      });
      verifyEmailMock.mockImplementation(
        () =>
          ({
            verifyEmail: mockVerifyEmail,
          }) as unknown
      );
      const { result } = renderHook(() => useEmailVerification());
      await act(async () => {
        result.current.verify('token');
      });
      expect(result.current.status).toBe('ERROR');
      expect(result.current.errorCode).toBe(code);
    }
  });
});
