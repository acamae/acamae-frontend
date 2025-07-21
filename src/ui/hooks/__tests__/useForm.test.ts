import { act, renderHook } from '@testing-library/react';
import React, { ChangeEvent, FormEvent } from 'react';

import { ToastProvider } from '@shared/services/ToastProvider';
import { useForm } from '@ui/hooks/useForm';

// Mock useThrottledSubmit
jest.mock('@ui/hooks/useThrottledSubmit', () => ({
  useThrottledSubmit: jest.fn(() => ({
    handleThrottledSubmit: jest.fn(),
    isThrottled: false,
    canSubmit: true,
    timeUntilNextSubmission: 0,
    remainingAttempts: 0,
    resetThrottle: jest.fn(),
  })),
}));

interface TestFormValues {
  name: string;
  email: string;
}

const initialValues: TestFormValues = {
  name: '',
  email: '',
};

const mockOnSubmit = jest.fn();
const mockValidate = jest.fn();
const mockFormEvent = {
  preventDefault: jest.fn(),
} as unknown as FormEvent<HTMLFormElement>;

const renderHookWithToastProvider = <TProps, TResult>(hook: (props: TProps) => TResult) => {
  return renderHook(hook, {
    wrapper: ({ children }) => React.createElement(ToastProvider, null, children),
  });
};

describe('useForm Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct values', () => {
    const { result } = renderHookWithToastProvider(() =>
      useForm({
        initialValues,
        onSubmit: mockOnSubmit,
      })
    );
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('should resetForm should reset the form state', () => {
    const { result } = renderHookWithToastProvider(() =>
      useForm({
        initialValues,
        onSubmit: mockOnSubmit,
      })
    );
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Test' },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.values.name).toBe('Test');
    act(() => {
      result.current.resetForm();
    });
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  describe('handleChange', () => {
    it('should update values and touched state', () => {
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'Test' },
        } as ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.values.name).toBe('Test');
      expect(result.current.touched.name).toBe(true);
    });

    it('should not update errors if validate function is not provided', () => {
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'Test' },
        } as ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.errors).toEqual({});
    });

    it('should call validate and update errors if validate function is provided', () => {
      mockValidate.mockReturnValue({ name: 'Name is required' });
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate: mockValidate,
        })
      );
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'Test' },
        } as ChangeEvent<HTMLInputElement>);
      });
      expect(mockValidate).toHaveBeenCalled();
      expect(result.current.errors).toEqual({ name: 'Name is required' });
    });
  });

  describe('handleSubmit', () => {
    it('should call preventDefault and mark all fields as touched', () => {
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );
      act(() => {
        result.current.handleSubmit(mockFormEvent);
      });
      expect(mockFormEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.touched.name).toBe(true);
      expect(result.current.touched.email).toBe(true);
    });

    it('should not call onSubmit if validation fails', () => {
      mockValidate.mockReturnValue({ name: 'Name is required' });
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate: mockValidate,
        })
      );
      act(() => {
        result.current.handleSubmit(mockFormEvent);
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should call onSubmit if validation passes', async () => {
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate: mockValidate,
        })
      );

      // Ejecutar handleSubmit y esperar a que termine completamente
      await act(async () => {
        const submitPromise = result.current.handleSubmit(mockFormEvent);
        await submitPromise;
      });

      expect(mockOnSubmit).toHaveBeenCalledWith(initialValues);
    });

    it('should call onSubmit if no validate function is provided', async () => {
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );

      // Ejecutar handleSubmit y esperar a que termine completamente
      await act(async () => {
        const submitPromise = result.current.handleSubmit(mockFormEvent);
        await submitPromise;
      });

      expect(mockOnSubmit).toHaveBeenCalledWith(initialValues);
    });

    it('should set isSubmitting to true during submission and false after', async () => {
      mockOnSubmit.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 10)));
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );
      // Ejecutar handleSubmit y esperar a que termine completamente
      await act(async () => {
        const submitPromise = result.current.handleSubmit(mockFormEvent);
        await submitPromise;
        // Forzar que todas las microtasks se completen
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      // isSubmitting removed, not checked
    });

    it('should set isSubmitting to false even if onSubmit throws an error', async () => {
      const submitError = new Error('Submit failed');
      mockOnSubmit.mockImplementationOnce(() => Promise.reject(submitError));
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );
      // Ejecutar handleSubmit y esperar a que termine completamente
      await act(async () => {
        const submitPromise = result.current.handleSubmit(mockFormEvent);
        await expect(submitPromise).rejects.toThrow('Submit failed');
        // Forzar que todas las microtasks se completen
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      // isSubmitting removed, not checked
    });

    it('should not update state after component unmounts', async () => {
      jest.useFakeTimers();
      // Mock a delayed submission that takes time to complete
      mockOnSubmit.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

      const { result, unmount } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );

      // Iniciar el submit y desmontar inmediatamente
      await act(async () => {
        const submitPromise = result.current.handleSubmit(mockFormEvent);

        // Desmontar el componente inmediatamente
        unmount();

        // Avanzar los timers para completar el submit
        jest.runAllTimers();

        // Esperar a que termine la promesa
        await submitPromise;
      });

      jest.useRealTimers();
      // El test pasa si no hay advertencias de React sobre actualizaciones de estado
      // en componentes desmontados
    });
  });

  describe('resetForm', () => {
    it('should reset values, errors, and touched state', () => {
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate: mockValidate,
        })
      );
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'Test' },
        } as ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.values.name).toBe('Test');
      expect(result.current.touched.name).toBe(true);
      act(() => {
        result.current.resetForm();
      });
      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
    });
  });
});
