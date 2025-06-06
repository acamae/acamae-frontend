import { renderHook } from '@testing-library/react';

import { logoutAction } from '@application/state/actions/auth.actions';
import { useAppDispatch, useAppSelector } from '@application/state/hooks';
import { setExpiresAt, showModal } from '@application/state/slices/sessionTimerSlice';
import { sessionExpiryService } from '@infrastructure/storage/sessionExpiryService';

import SessionTimerInitializer from '../SessionTimerInitializer';

// Mock de las dependencias
jest.mock('@application/state/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('@application/state/actions/auth.actions', () => ({
  logoutAction: jest.fn(),
}));

jest.mock('@application/state/slices/sessionTimerSlice', () => ({
  setExpiresAt: jest.fn(),
  showModal: jest.fn(),
}));

jest.mock('@infrastructure/storage/sessionExpiryService', () => ({
  sessionExpiryService: {
    getExpiresAt: jest.fn(),
  },
}));

describe('SessionTimerInitializer', () => {
  const mockDispatch = jest.fn();
  const mockGetExpiresAt = sessionExpiryService.getExpiresAt as unknown as jest.Mock;
  const mockSetExpiresAt = setExpiresAt as unknown as jest.Mock;
  const mockShowModal = showModal as unknown as jest.Mock;
  const mockLogoutAction = logoutAction as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    mockLogoutAction.mockReturnValue({ type: 'LOGOUT' });
    mockSetExpiresAt.mockReturnValue({ type: 'SET_EXPIRES_AT' });
    mockShowModal.mockReturnValue({ type: 'SHOW_MODAL' });
  });

  it('no hace nada cuando el usuario no está autenticado', () => {
    (useAppSelector as unknown as jest.Mock).mockReturnValue(false);
    renderHook(() => SessionTimerInitializer());

    expect(mockGetExpiresAt).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('despacha logout cuando la sesión ha expirado', () => {
    (useAppSelector as unknown as jest.Mock).mockReturnValue(true);
    mockGetExpiresAt.mockReturnValue(Date.now() - 1000); // Sesión expirada

    renderHook(() => SessionTimerInitializer());

    expect(mockGetExpiresAt).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(mockLogoutAction());
  });

  it('muestra el modal cuando la sesión está cerca de expirar', () => {
    const warningSeconds = 30;
    const expiresAt = Date.now() + warningSeconds * 1000;

    (useAppSelector as unknown as jest.Mock).mockReturnValue(true);
    mockGetExpiresAt.mockReturnValue(expiresAt);

    // Mock de la variable de entorno
    const originalEnv = process.env.REACT_APP_SESSION_TIMEOUT_WARNING_SECONDS;
    process.env.REACT_APP_SESSION_TIMEOUT_WARNING_SECONDS = warningSeconds.toString();

    renderHook(() => SessionTimerInitializer());

    expect(mockGetExpiresAt).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(mockSetExpiresAt(expiresAt));
    expect(mockDispatch).toHaveBeenCalledWith(mockShowModal());

    // Restaurar variable de entorno
    process.env.REACT_APP_SESSION_TIMEOUT_WARNING_SECONDS = originalEnv;
  });

  it('solo actualiza expiresAt cuando la sesión está lejos de expirar', () => {
    const warningSeconds = 30;
    const expiresAt = Date.now() + (warningSeconds + 10) * 1000;

    (useAppSelector as unknown as jest.Mock).mockReturnValue(true);
    mockGetExpiresAt.mockReturnValue(expiresAt);

    // Mock de la variable de entorno
    const originalEnv = process.env.REACT_APP_SESSION_TIMEOUT_WARNING_SECONDS;
    process.env.REACT_APP_SESSION_TIMEOUT_WARNING_SECONDS = warningSeconds.toString();

    renderHook(() => SessionTimerInitializer());

    expect(mockGetExpiresAt).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(mockSetExpiresAt(expiresAt));
    expect(mockDispatch).not.toHaveBeenCalledWith(mockShowModal());

    // Restaurar variable de entorno
    process.env.REACT_APP_SESSION_TIMEOUT_WARNING_SECONDS = originalEnv;
  });
});
