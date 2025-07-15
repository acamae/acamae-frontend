import { renderHook, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import { securityThrottleService, generateActionId } from '@shared/utils/securityUtils';
import { useToast } from '@ui/hooks/useToast';

import { useThrottledSubmit, useAuthThrottledSubmit } from '../useThrottledSubmit';

// Mock dependencies
jest.mock('react-i18next');
jest.mock('@ui/hooks/useToast');
jest.mock('@shared/utils/securityUtils', () => ({
  securityThrottleService: {
    canPerformAction: jest.fn(),
    getTimeUntilNextAction: jest.fn(),
    getThrottleState: jest.fn(),
    clearThrottleState: jest.fn(),
    getRemainingAttempts: jest.fn(),
  },
  generateActionId: jest.fn(
    (formName: string, actionType = 'submit') => `${formName}-${actionType}`
  ),
}));

const mockT = jest
  .fn()
  .mockImplementation((key: string, options?: { minutes?: number; seconds?: number }) => {
    if (key === 'security.throttle.blocked') {
      return `Blocked for ${options?.minutes} minutes`;
    }
    if (key === 'security.throttle.wait') {
      return `Wait ${options?.seconds} seconds`;
    }
    return key;
  });

const mockToast = {
  error: jest.fn(),
  warning: jest.fn(),
  success: jest.fn(),
  info: jest.fn(),
};

// Get the mocked services
const mockSecurityService = securityThrottleService as jest.Mocked<typeof securityThrottleService>;
const mockGenerateActionId = generateActionId as jest.MockedFunction<typeof generateActionId>;

describe('useThrottledSubmit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();

    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (useToast as jest.Mock).mockReturnValue(mockToast);

    // Configure default mock returns
    mockSecurityService.canPerformAction.mockReturnValue(true);
    mockSecurityService.getTimeUntilNextAction.mockReturnValue(0);
    mockSecurityService.getThrottleState.mockReturnValue(null);
    mockSecurityService.getRemainingAttempts.mockReturnValue(3);
    mockGenerateActionId.mockImplementation(
      (formName: string, actionType = 'submit') => `${formName}-${actionType}`
    );
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('should initialize with correct default values', () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

    mockSecurityService.getTimeUntilNextAction.mockReturnValue(0);

    const { result } = renderHook(() =>
      useThrottledSubmit({
        formName: 'test-form',
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.isThrottled).toBe(false);
    expect(result.current.canSubmit).toBe(true);
    expect(result.current.timeUntilNextSubmission).toBe(0);
  });

  it('should update throttle state when time remaining changes', () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

    mockSecurityService.getTimeUntilNextAction.mockReturnValue(5000);

    const { result } = renderHook(() =>
      useThrottledSubmit({
        formName: 'test-form',
        onSubmit: mockOnSubmit,
      })
    );

    // El estado se actualiza inmediatamente al montar el componente
    expect(result.current.isThrottled).toBe(true);
    expect(result.current.timeUntilNextSubmission).toBe(5000);

    // Cambiar el valor para simular el paso del tiempo
    mockSecurityService.getTimeUntilNextAction.mockReturnValue(4000);

    // Advance timer to trigger the interval
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isThrottled).toBe(true);
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.timeUntilNextSubmission).toBe(4000);
  });

  it('should handle successful submit when action is allowed', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

    mockSecurityService.canPerformAction.mockReturnValue(true);
    mockSecurityService.getTimeUntilNextAction.mockReturnValue(0);

    const { result } = renderHook(() =>
      useThrottledSubmit({
        formName: 'test-form',
        onSubmit: mockOnSubmit,
      })
    );

    await act(async () => {
      await result.current.handleThrottledSubmit();
    });

    expect(mockSecurityService.canPerformAction).toHaveBeenCalledWith(
      'test-form-submit',
      expect.any(Object)
    );
    expect(mockOnSubmit).toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
    expect(mockToast.warning).not.toHaveBeenCalled();
  });

  it('should block submit and show warning when action is throttled', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

    mockSecurityService.canPerformAction.mockReturnValue(false);
    mockSecurityService.getTimeUntilNextAction.mockReturnValue(3000);
    mockSecurityService.getThrottleState.mockReturnValue({
      isBlocked: false,
      attemptCount: 2,
      lastSubmission: Date.now(),
      windowStart: Date.now(),
    });

    const { result } = renderHook(() =>
      useThrottledSubmit({
        formName: 'test-form',
        onSubmit: mockOnSubmit,
        showToastOnThrottle: true,
      })
    );

    await act(async () => {
      await result.current.handleThrottledSubmit();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(mockToast.warning).toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it('should block submit and show error when user is blocked', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

    mockSecurityService.canPerformAction.mockReturnValue(false);
    mockSecurityService.getTimeUntilNextAction.mockReturnValue(300000);
    mockSecurityService.getThrottleState.mockReturnValue({
      isBlocked: true,
      attemptCount: 5,
      lastSubmission: Date.now(),
      windowStart: Date.now(),
    });

    const { result } = renderHook(() =>
      useThrottledSubmit({
        formName: 'test-form',
        onSubmit: mockOnSubmit,
        showToastOnThrottle: true,
      })
    );

    await act(async () => {
      await result.current.handleThrottledSubmit();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(mockToast.error).toHaveBeenCalled();
    expect(mockToast.warning).not.toHaveBeenCalled();
  });

  it('should not show toast when showToastOnThrottle is false', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

    mockSecurityService.canPerformAction.mockReturnValue(false);
    mockSecurityService.getTimeUntilNextAction.mockReturnValue(3000);
    mockSecurityService.getThrottleState.mockReturnValue({
      isBlocked: false,
      attemptCount: 2,
      lastSubmission: Date.now(),
      windowStart: Date.now(),
    });

    const { result } = renderHook(() =>
      useThrottledSubmit({
        formName: 'test-form',
        onSubmit: mockOnSubmit,
        showToastOnThrottle: false,
      })
    );

    await act(async () => {
      await result.current.handleThrottledSubmit();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(mockToast.warning).not.toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it('should propagate errors from onSubmit', async () => {
    const error = new Error('Submit failed');
    const mockOnSubmit = jest.fn().mockRejectedValue(error);

    mockSecurityService.canPerformAction.mockReturnValue(true);
    mockSecurityService.getTimeUntilNextAction.mockReturnValue(0);

    const { result } = renderHook(() =>
      useThrottledSubmit({
        formName: 'test-form',
        onSubmit: mockOnSubmit,
      })
    );

    await expect(
      act(async () => {
        await result.current.handleThrottledSubmit();
      })
    ).rejects.toThrow('Submit failed');

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should reset throttle state when resetThrottle is called', () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

    mockSecurityService.getTimeUntilNextAction.mockReturnValue(0);

    const { result } = renderHook(() =>
      useThrottledSubmit({
        formName: 'test-form',
        onSubmit: mockOnSubmit,
      })
    );

    act(() => {
      result.current.resetThrottle();
    });

    expect(mockSecurityService.clearThrottleState).toHaveBeenCalledWith('test-form-submit');
  });

  it('should update time until next submission every second', () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

    // Configurar el mock para devolver valores secuenciales
    let callCount = 0;
    mockSecurityService.getTimeUntilNextAction.mockImplementation(() => {
      const values = [5000, 4000, 3000, 2000];
      return values[callCount++] || 0;
    });

    const { result } = renderHook(() =>
      useThrottledSubmit({
        formName: 'test-form',
        onSubmit: mockOnSubmit,
      })
    );

    // El estado se actualiza inmediatamente al montar el componente
    expect(result.current.timeUntilNextSubmission).toBe(5000);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.timeUntilNextSubmission).toBe(4000);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.timeUntilNextSubmission).toBe(3000);
  });
});

describe('useAuthThrottledSubmit', () => {
  beforeEach(() => {
    // Configure mocks for this test
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (useToast as jest.Mock).mockReturnValue(mockToast);

    mockSecurityService.canPerformAction.mockReturnValue(true);
    mockSecurityService.getTimeUntilNextAction.mockReturnValue(0);
    mockSecurityService.getThrottleState.mockReturnValue(null);
    mockSecurityService.getRemainingAttempts.mockReturnValue(3);
    mockGenerateActionId.mockImplementation(
      (formName: string, actionType = 'submit') => `${formName}-${actionType}`
    );
  });

  it('should use AUTH_FORMS config', () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuthThrottledSubmit('auth-form', mockOnSubmit));

    expect(result.current.canSubmit).toBe(true);
  });
});
