import { act, renderHook } from '@testing-library/react';

import { ToastOptions } from '@domain/types/toast';
import { useToastContext } from '@shared/services/ToastProvider';
import { useToast } from '@ui/hooks/useToast';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => `translated_${key}`,
  }),
}));

// Mock useToastContext
jest.mock('@shared/services/ToastProvider', () => ({
  useToastContext: jest.fn(),
}));

const mockUseToastContext = useToastContext as jest.MockedFunction<typeof useToastContext>;

describe('useToast', () => {
  const mockToastContext = {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    show: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseToastContext.mockReturnValue(mockToastContext);
  });

  describe('initialize', () => {
    it('should not throw when called', () => {
      const { result } = renderHook(() => useToast());

      expect(() => {
        act(() => {
          result.current.initialize();
        });
      }).not.toThrow();
    });
  });

  describe('error', () => {
    it('should show error toast with translated message when title is provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('error.message', 'error.title');
      });

      expect(mockToastContext.error).toHaveBeenCalledWith(
        'translated_error.message',
        'translated_error.title',
        undefined
      );
    });

    it('should show error toast with translated message when title is not provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('error.message');
      });

      expect(mockToastContext.error).toHaveBeenCalledWith(
        'translated_error.message',
        undefined,
        undefined
      );
    });
  });

  describe('success', () => {
    it('should show success toast with translated message when title is provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('success.message', 'success.title');
      });

      expect(mockToastContext.success).toHaveBeenCalledWith(
        'translated_success.message',
        'translated_success.title',
        undefined
      );
    });

    it('should show success toast with translated message when title is not provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('success.message');
      });

      expect(mockToastContext.success).toHaveBeenCalledWith(
        'translated_success.message',
        undefined,
        undefined
      );
    });
  });

  describe('warning', () => {
    it('should show warning toast with translated message when title is provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning('warning.message', 'warning.title');
      });

      expect(mockToastContext.warning).toHaveBeenCalledWith(
        'translated_warning.message',
        'translated_warning.title',
        undefined
      );
    });

    it('should show warning toast with translated message when title is not provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning('warning.message');
      });

      expect(mockToastContext.warning).toHaveBeenCalledWith(
        'translated_warning.message',
        undefined,
        undefined
      );
    });
  });

  describe('info', () => {
    it('should show info toast with translated message when title is provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('info.message', 'info.title');
      });

      expect(mockToastContext.info).toHaveBeenCalledWith(
        'translated_info.message',
        'translated_info.title',
        undefined
      );
    });

    it('should show info toast with translated message when title is not provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('info.message');
      });

      expect(mockToastContext.info).toHaveBeenCalledWith(
        'translated_info.message',
        undefined,
        undefined
      );
    });
  });

  describe('show', () => {
    it('should show custom toast with translated options', () => {
      const { result } = renderHook(() => useToast());

      const options: ToastOptions = {
        message: 'custom.message',
        title: 'custom.title',
        type: 'Success',
      };

      act(() => {
        result.current.show(options);
      });

      expect(mockToastContext.show).toHaveBeenCalledWith({
        message: 'translated_custom.message',
        title: 'translated_custom.title',
        type: 'Success',
      });
    });

    it('should show custom toast without title', () => {
      const { result } = renderHook(() => useToast());

      const options: ToastOptions = {
        message: 'custom.message',
        type: 'Info',
      };

      act(() => {
        result.current.show(options);
      });

      expect(mockToastContext.show).toHaveBeenCalledWith({
        message: 'translated_custom.message',
        title: undefined,
        type: 'Info',
      });
    });
  });
});
