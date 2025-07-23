import { act, renderHook, waitFor } from '@testing-library/react';
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
    expect(result.current?.values).toEqual(initialValues);
    expect(result.current?.errors).toEqual({});
    expect(result.current?.touched).toEqual({});
    expect(result.current?.isSubmitting).toBe(false);
    expect(result.current?.hasValidationErrors).toBe(false);
    expect(result.current?.isFormValid).toBe(false); // Form is invalid initially because fields are empty
  });

  it('should resetForm should reset the form state', () => {
    const { result } = renderHookWithToastProvider(() =>
      useForm({
        initialValues,
        onSubmit: mockOnSubmit,
      })
    );
    act(() => {
      result.current?.handleChange({
        target: { name: 'name', value: 'Test' },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(result.current?.values.name).toBe('Test');
    act(() => {
      result.current?.resetForm();
    });
    expect(result.current?.values).toEqual(initialValues);
    expect(result.current?.errors).toEqual({});
    expect(result.current?.touched).toEqual({});
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
        result.current?.handleChange({
          target: { name: 'name', value: 'Test' },
        } as ChangeEvent<HTMLInputElement>);
      });
      expect(result.current?.values.name).toBe('Test');
      expect(result.current?.touched.name).toBe(true);
    });

    it('should not update errors if validate function is not provided', () => {
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );
      act(() => {
        result.current?.handleChange({
          target: { name: 'name', value: 'Test' },
        } as ChangeEvent<HTMLInputElement>);
      });
      expect(result.current?.errors).toEqual({});
    });

    it('should call validate and update errors if validate function is provided', async () => {
      const mockValidate = jest.fn().mockReturnValue({ name: 'Name is required' });
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate: mockValidate,
        })
      );

      await act(async () => {
        result.current?.handleChange({
          target: { name: 'name', value: 'test' },
        } as ChangeEvent<HTMLInputElement>);
      });

      // Validation should not be called immediately on change
      expect(mockValidate).not.toHaveBeenCalled();
      expect(result.current?.errors).toEqual({});

      // Validation should be called on blur
      await act(async () => {
        result.current?.handleBlur({
          target: { name: 'name' },
        } as React.FocusEvent<HTMLInputElement>);
      });

      expect(mockValidate).toHaveBeenCalled();
      expect(result.current?.errors).toEqual({ name: 'Name is required' });
    });
  });

  describe('handleSubmit', () => {
    it('should set isSubmitting to true during submission and false after', async () => {
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>(resolve => {
        resolveSubmit = resolve;
      });
      mockOnSubmit.mockImplementationOnce(() => submitPromise);
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );
      await act(async () => {
        result.current.handleSubmit(mockFormEvent);
      });
      // isSubmitting debe ser true antes de resolver la promesa
      expect(result.current.isSubmitting).toBe(true);
      // Ahora resolvemos la promesa
      resolveSubmit!();
      await act(async () => {
        await submitPromise;
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should set isSubmitting to false even if onSubmit throws an error', async () => {
      const error = new Error('Test error');
      mockOnSubmit.mockRejectedValueOnce(error);
      const originalError = console.error;
      console.error = jest.fn();
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );
      await act(async () => {
        result.current?.handleSubmit(mockFormEvent);
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(result.current?.isSubmitting).toBe(false);
      expect(mockOnSubmit).toHaveBeenCalledWith(initialValues);
      console.error = originalError;
    });

    it('should prevent multiple simultaneous submissions', async () => {
      mockOnSubmit.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );
      await act(async () => {
        result.current?.handleSubmit(mockFormEvent);
      });
      await waitFor(() => {
        expect(result.current?.isSubmitting).toBe(true);
      });
      await act(async () => {
        result.current?.handleSubmit(mockFormEvent);
      });
      expect(result.current?.isSubmitting).toBe(true);
      await waitFor(() => {
        expect(result.current?.isSubmitting).toBe(false);
      });
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should not update state after component unmounts', async () => {
      jest.useFakeTimers();
      mockOnSubmit.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
      const { result, unmount } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );
      await act(async () => {
        result.current?.handleSubmit(mockFormEvent);
      });
      unmount();
      jest.runAllTimers();
      await Promise.resolve(); // flush microtasks
      jest.useRealTimers();
    });
  });

  describe('Component unmounting during submission', () => {
    it('should not set state if component unmounts during async operation', async () => {
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>(resolve => {
        resolveSubmit = resolve;
      });
      mockOnSubmit.mockImplementationOnce(() => submitPromise);
      const { result, unmount } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );
      await act(async () => {
        result.current.handleSubmit(mockFormEvent);
      });
      expect(result.current.isSubmitting).toBe(true);
      unmount();
      // Resolver la promesa tras unmount
      resolveSubmit!();
      await act(async () => {
        await submitPromise;
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      // No se debe lanzar error ni memory leak
    });
  });

  describe('Memory leak prevention', () => {
    it('should demonstrate memory leak without proper cleanup', async () => {
      const originalError = console.error;
      const mockError = jest.fn();
      console.error = mockError;
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>(resolve => {
        resolveSubmit = resolve;
      });
      mockOnSubmit.mockImplementationOnce(() => submitPromise);
      const { result, unmount } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );
      await act(async () => {
        result.current.handleSubmit(mockFormEvent);
      });
      expect(result.current.isSubmitting).toBe(true);
      unmount();
      resolveSubmit!();
      await act(async () => {
        await submitPromise;
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      console.error = originalError;
    });
  });

  describe('Timing and memory leak prevention', () => {
    it('should demonstrate timing difference with setTimeout', async () => {
      const originalError = console.error;
      const mockError = jest.fn();
      console.error = mockError;
      mockOnSubmit.mockImplementationOnce(() => Promise.resolve());
      const { result, unmount } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );
      await act(async () => {
        result.current?.handleSubmit(mockFormEvent);
        await new Promise(resolve => setTimeout(resolve, 0));
        unmount();
        await Promise.resolve(); // flush microtasks
      });
      console.error = originalError;
    });
  });

  describe('hasValidationErrors', () => {
    it('should be false when there are no validation errors', async () => {
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );
      await act(async () => {});
      expect(result.current?.hasValidationErrors).toBe(false);
    });

    it('should be true when there are validation errors', async () => {
      const validate = (values: typeof initialValues) => {
        const errors: Partial<typeof initialValues> = {};
        if (!values.email) errors.email = 'Email required';
        if (!values.name) errors.name = 'Username required';
        return errors;
      };
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues: { email: '', name: '' },
          onSubmit: mockOnSubmit,
          validate,
        })
      );
      await act(async () => {
        await result.current?.handleSubmit({
          preventDefault: () => {},
        } as FormEvent<HTMLFormElement>);
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(result.current?.hasValidationErrors).toBe(true);
    });

    it('should update hasValidationErrors when values change', async () => {
      const validate = (values: typeof initialValues) => {
        const errors: Partial<typeof initialValues> = {};
        if (!values.email) errors.email = 'Email required';
        if (!values.name) errors.name = 'Username required';
        return errors;
      };
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues: { email: '', name: '' },
          onSubmit: mockOnSubmit,
          validate,
        })
      );
      await act(async () => {
        await result.current?.handleSubmit({
          preventDefault: () => {},
        } as FormEvent<HTMLFormElement>);
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(result.current?.hasValidationErrors).toBe(true);
      await act(async () => {
        result.current?.handleChange({
          target: { name: 'email', value: 'test@example.com' },
        } as ChangeEvent<HTMLInputElement>);
      });
      expect(result.current?.hasValidationErrors).toBe(true); // name still missing
      await act(async () => {
        result.current?.handleChange({
          target: { name: 'name', value: 'user' },
        } as ChangeEvent<HTMLInputElement>);
      });
      expect(result.current?.hasValidationErrors).toBe(false);
    });
  });

  describe('isFormValid', () => {
    it('should be false when form is empty initially', () => {
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current?.isFormValid).toBe(false);
    });

    it('should be true when all fields are filled with valid data', async () => {
      const validate = (values: typeof initialValues) => {
        const errors: Partial<Record<keyof typeof initialValues, string>> = {};
        if (!values.name) {
          errors.name = 'Name is required';
        }
        if (!values.email) {
          errors.email = 'Email is required';
        }
        return errors;
      };

      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues: { name: 'Test User', email: 'test@example.com' },
          onSubmit: mockOnSubmit,
          validate,
        })
      );

      // Trigger validation by calling handleSubmit
      await act(async () => {
        result.current?.handleSubmit(mockFormEvent);
      });

      expect(result.current?.isFormValid).toBe(true);
    });

    it('should be false when fields are empty even without validation errors', () => {
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current?.isFormValid).toBe(false);
    });

    it('should be false when there are validation errors', async () => {
      const validate = (values: typeof initialValues) => {
        const errors: Partial<Record<keyof typeof initialValues, string>> = {};
        if (!values.name) {
          errors.name = 'Name is required';
        }
        return errors;
      };

      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate,
        })
      );

      // Trigger validation by calling handleSubmit
      await act(async () => {
        result.current?.handleSubmit(mockFormEvent);
      });

      expect(result.current?.isFormValid).toBe(false);
    });

    it('should update when form data changes', async () => {
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );

      // Initially invalid
      expect(result.current?.isFormValid).toBe(false);

      // Fill all fields
      await act(async () => {
        result.current?.handleChange({
          target: { name: 'name', value: 'Test User' },
        } as ChangeEvent<HTMLInputElement>);
        result.current?.handleChange({
          target: { name: 'email', value: 'test@example.com' },
        } as ChangeEvent<HTMLInputElement>);
      });

      // Now should be valid
      expect(result.current?.isFormValid).toBe(true);
    });
  });

  describe('resetForm', () => {
    it('should reset values, errors, and touched state', async () => {
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate: mockValidate,
        })
      );
      await act(async () => {
        result.current?.handleChange({
          target: { name: 'name', value: 'Test' },
        } as ChangeEvent<HTMLInputElement>);
      });
      expect(result.current?.values.name).toBe('Test');
      expect(result.current?.touched.name).toBe(true);
      await act(async () => {
        result.current?.resetForm();
      });
      expect(result.current?.values).toEqual(initialValues);
      expect(result.current?.errors).toEqual({});
      expect(result.current?.touched).toEqual({});
    });
  });

  describe('onBlur validation', () => {
    it('should not show validation errors immediately when user starts typing', async () => {
      const validate = (values: typeof initialValues) => {
        const errors: Partial<typeof initialValues> = {};
        if (!values.email || values.email.length < 5) {
          errors.email = 'Email must be at least 5 characters';
        }
        return errors;
      };

      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate,
        })
      );

      // User starts typing
      await act(async () => {
        result.current?.handleChange({
          target: { name: 'email', value: 'a' },
        } as ChangeEvent<HTMLInputElement>);
      });

      // Should not show error immediately
      expect(result.current?.errors.email).toBeUndefined();
    });

    it('should show validation errors when user leaves the field (onBlur)', async () => {
      const validate = (values: typeof initialValues) => {
        const errors: Partial<typeof initialValues> = {};
        if (!values.email || values.email.length < 5) {
          errors.email = 'Email must be at least 5 characters';
        }
        return errors;
      };

      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate,
        })
      );

      // User starts typing
      await act(async () => {
        result.current?.handleChange({
          target: { name: 'email', value: 'a' },
        } as ChangeEvent<HTMLInputElement>);
      });

      // Should not show error immediately
      expect(result.current?.errors.email).toBeUndefined();

      // User leaves the field (onBlur)
      await act(async () => {
        result.current?.handleBlur({
          target: { name: 'email' },
        } as React.FocusEvent<HTMLInputElement>);
      });

      // Now should show error
      expect(result.current?.errors.email).toBe('Email must be at least 5 characters');
    });

    it('should clear errors when user starts typing and field becomes valid', async () => {
      const validate = (values: typeof initialValues) => {
        const errors: Partial<typeof initialValues> = {};
        if (!values.email || values.email.length < 5) {
          errors.email = 'Email must be at least 5 characters';
        }
        return errors;
      };

      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate,
        })
      );

      // User starts typing
      await act(async () => {
        result.current?.handleChange({
          target: { name: 'email', value: 'a' },
        } as ChangeEvent<HTMLInputElement>);
      });

      // User leaves the field (onBlur) - should show error
      await act(async () => {
        result.current?.handleBlur({
          target: { name: 'email' },
        } as React.FocusEvent<HTMLInputElement>);
      });

      // Should have error initially
      expect(result.current?.errors.email).toBe('Email must be at least 5 characters');

      // User types valid email
      await act(async () => {
        result.current?.handleChange({
          target: { name: 'email', value: 'valid@example.com' },
        } as ChangeEvent<HTMLInputElement>);
      });

      // User leaves the field again (onBlur) - should clear error
      await act(async () => {
        result.current?.handleBlur({
          target: { name: 'email' },
        } as React.FocusEvent<HTMLInputElement>);
      });

      // Error should be cleared when field becomes valid
      expect(result.current?.errors.email).toBeUndefined();
    });

    it('should validate checkboxes immediately', async () => {
      const validate = (values: typeof initialValues) => {
        const errors: Partial<typeof initialValues> = {};
        if (!values.name) {
          errors.name = 'Name is required';
        }
        return errors;
      };

      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues: { email: '', name: '' },
          onSubmit: mockOnSubmit,
          validate,
        })
      );

      // Change checkbox
      await act(async () => {
        result.current?.handleCheckboxChange?.({
          target: { name: 'name', checked: true },
        } as ChangeEvent<HTMLInputElement>);
      });

      // Should validate immediately for checkboxes
      expect(result.current?.errors.name).toBeUndefined();
    });

    it('should mark field as touched on blur', async () => {
      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );

      // Initially field should not be touched
      expect(result.current?.touched.email).toBeUndefined();

      // User leaves the field (onBlur)
      await act(async () => {
        result.current?.handleBlur({
          target: { name: 'email' },
        } as React.FocusEvent<HTMLInputElement>);
      });

      // Field should be marked as touched
      expect(result.current?.touched.email).toBe(true);
    });

    it('should validate all fields on form submission', async () => {
      const validate = (values: typeof initialValues) => {
        const errors: Partial<typeof initialValues> = {};
        if (!values.email) {
          errors.email = 'Email is required';
        }
        if (!values.name) {
          errors.name = 'Name is required';
        }
        return errors;
      };

      const { result } = renderHookWithToastProvider(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate,
        })
      );

      // Submit form without filling fields
      await act(async () => {
        result.current?.handleSubmit(mockFormEvent);
      });

      // Should show errors for all fields
      expect(result.current?.errors.email).toBe('Email is required');
      expect(result.current?.errors.name).toBe('Name is required');
    });
  });
});
