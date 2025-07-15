import { renderHook, act } from '@testing-library/react';

import { toastService } from '@shared/services/toastService';
import { useToast } from '@ui/hooks/useToast';

// Mock del servicio de toast
jest.mock('@shared/services/toastService', () => ({
  toastService: {
    initialize: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    show: jest.fn(),
  },
}));

// Mock de react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => `translated_${key}`,
  }),
}));

const mockToastService = toastService as jest.Mocked<typeof toastService>;

describe('useToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should call toastService.initialize', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.initialize();
      });

      expect(mockToastService.initialize).toHaveBeenCalledTimes(1);
    });
  });

  describe('error', () => {
    it('should show error toast with translated message when title is provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('error.message', 'error.title');
      });

      expect(mockToastService.error).toHaveBeenCalledWith(
        'translated_error.title: translated_error.message'
      );
    });

    it('should show error toast with translated message when title is not provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('error.message');
      });

      expect(mockToastService.error).toHaveBeenCalledWith('translated_error.message');
    });

    it('should show error toast with translated message when title is undefined', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('error.message');
      });

      expect(mockToastService.error).toHaveBeenCalledWith('translated_error.message');
    });
  });

  describe('success', () => {
    it('should show success toast with translated message when title is provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('success.message', 'success.title');
      });

      expect(mockToastService.success).toHaveBeenCalledWith(
        'translated_success.title: translated_success.message'
      );
    });

    it('should show success toast with translated message when title is not provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('success.message');
      });

      expect(mockToastService.success).toHaveBeenCalledWith('translated_success.message');
    });

    it('should show success toast with translated message when title is undefined', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('success.message');
      });

      expect(mockToastService.success).toHaveBeenCalledWith('translated_success.message');
    });
  });

  describe('warning', () => {
    it('should show warning toast with translated message when title is provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning('warning.message', 'warning.title');
      });

      expect(mockToastService.warning).toHaveBeenCalledWith(
        'translated_warning.title: translated_warning.message'
      );
    });

    it('should show warning toast with translated message when title is not provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning('warning.message');
      });

      expect(mockToastService.warning).toHaveBeenCalledWith('translated_warning.message');
    });

    it('should show warning toast with translated message when title is undefined', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning('warning.message');
      });

      expect(mockToastService.warning).toHaveBeenCalledWith('translated_warning.message');
    });
  });

  describe('info', () => {
    it('should show info toast with translated message when title is provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('info.message', 'info.title');
      });

      expect(mockToastService.info).toHaveBeenCalledWith(
        'translated_info.title: translated_info.message'
      );
    });

    it('should show info toast with translated message when title is not provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('info.message');
      });

      expect(mockToastService.info).toHaveBeenCalledWith('translated_info.message');
    });

    it('should show info toast with translated message when title is undefined', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('info.message');
      });

      expect(mockToastService.info).toHaveBeenCalledWith('translated_info.message');
    });
  });

  describe('show', () => {
    it('should show custom toast with translated message when title is provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.show({
          message: 'custom.message',
          title: 'custom.title',
          type: 'Info',
        });
      });

      expect(mockToastService.show).toHaveBeenCalledWith(
        'translated_custom.title: translated_custom.message'
      );
    });

    it('should show custom toast with translated message when title is not provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.show({
          message: 'custom.message',
          type: 'Info',
        });
      });

      expect(mockToastService.show).toHaveBeenCalledWith('translated_custom.message');
    });

    it('should show custom toast with translated message when title is undefined', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.show({
          message: 'custom.message',
          title: undefined,
          type: 'Info',
        });
      });

      expect(mockToastService.show).toHaveBeenCalledWith('translated_custom.message');
    });
  });

  describe('return object', () => {
    it('should return all expected methods', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current).toHaveProperty('initialize');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('success');
      expect(result.current).toHaveProperty('warning');
      expect(result.current).toHaveProperty('info');
      expect(result.current).toHaveProperty('show');

      expect(typeof result.current.initialize).toBe('function');
      expect(typeof result.current.error).toBe('function');
      expect(typeof result.current.success).toBe('function');
      expect(typeof result.current.warning).toBe('function');
      expect(typeof result.current.info).toBe('function');
      expect(typeof result.current.show).toBe('function');
    });
  });
});
