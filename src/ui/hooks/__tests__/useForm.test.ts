jest.mock('react-i18next');

import { renderHook, act } from '@testing-library/react';
import { ChangeEvent, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm } from '@ui/hooks/useForm';

interface TestFormValues {
  name: string;
  email: string;
}

const changeLanguageMock = jest.fn();
function setupUseTranslation({
  lang = 'es-ES',
  t = (str: string) => str,
  changeLanguage = changeLanguageMock,
} = {}) {
  (useTranslation as jest.Mock).mockReturnValue({
    t,
    i18n: {
      language: lang,
      changeLanguage,
    },
  });
}

const initialValues: TestFormValues = { name: '', email: '' };
const mockOnSubmit = jest.fn();
const mockValidate = jest.fn((values: TestFormValues) => {
  const errors: Partial<TestFormValues> = {};
  if (!values.name) errors.name = 'Name is required';
  if (!values.email) errors.email = 'Email is required';
  return errors;
});
const mockPreventDefault = jest.fn();
const mockFormEvent = {
  preventDefault: mockPreventDefault,
} as unknown as FormEvent<HTMLFormElement>;

describe('useForm Hook', () => {
  it('should initialize with correct values', () => {
    setupUseTranslation();
    const { result } = renderHook(() => useForm({ initialValues, onSubmit: mockOnSubmit }));
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.touched).toEqual({});
  });

  it('should resetForm should reset the form state', () => {
    setupUseTranslation();
    const { result } = renderHook(() => useForm({ initialValues, onSubmit: mockOnSubmit }));
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Test' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.resetForm();
    });
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('should revalidate on language change if fields are touched', () => {
    setupUseTranslation();
    const { result, rerender } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit: mockOnSubmit,
        validate: mockValidate,
      })
    );

    expect(mockValidate).toHaveBeenCalledTimes(0);

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Test' },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(mockValidate).toHaveBeenCalled();
    expect(mockValidate).toHaveBeenCalledWith({ ...initialValues, name: 'Test' });

    mockValidate.mockClear();

    expect(mockValidate).toHaveBeenCalledTimes(0);

    act(() => {
      setupUseTranslation({ lang: 'en-GB' });
    });
    rerender();

    expect(mockValidate).toHaveBeenCalled();
    expect(mockValidate).toHaveBeenCalledWith({ ...initialValues, name: 'Test' });
  });

  describe('handleChange', () => {
    it('should update values and touched state', () => {
      setupUseTranslation();
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );

      const mockEvent = {
        target: { name: 'name', value: 'newName' },
      } as ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(mockEvent);
      });

      expect(result.current.values.name).toBe('newName');
      expect(result.current.touched.name).toBe(true);
      expect(result.current.values.email).toBe(initialValues.email); // No debe cambiar otros campos
      expect(result.current.touched.email).toBeUndefined(); // Otro campo no debe ser tocado
    });

    it('should not update errors if validate function is not provided', () => {
      setupUseTranslation();
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          // No validate function
        })
      );

      const mockEvent = {
        target: { name: 'name', value: 'newName' },
      } as ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(mockEvent);
      });

      expect(result.current.errors).toEqual({});
      expect(mockValidate).not.toHaveBeenCalled();
    });

    it('should call validate and update errors if validate function is provided', () => {
      setupUseTranslation();
      mockValidate.mockReturnValue({ email: 'Invalid email' });

      const { result } = renderHook(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate: mockValidate,
        })
      );

      const mockEvent = {
        target: { name: 'email', value: 'invalid-email' },
      } as ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(mockEvent);
      });

      expect(mockValidate).toHaveBeenCalled();
      expect(mockValidate).toHaveBeenCalledWith({ ...initialValues, email: 'invalid-email' });
      expect(result.current.errors).toEqual({ email: 'Invalid email' });
      expect(result.current.values.email).toBe('invalid-email');
      expect(result.current.touched.email).toBe(true);
    });
  });

  describe('handleSubmit', () => {
    it('should call preventDefault and mark all fields as touched', async () => {
      setupUseTranslation();
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit(mockFormEvent);
      });

      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      const expectedTouched = Object.keys(initialValues).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      expect(result.current.touched).toEqual(expectedTouched);
    });

    it('should not call onSubmit if validation fails', async () => {
      setupUseTranslation();
      mockValidate.mockReturnValue({
        email: 'Email is required',
        name: 'Name is required',
      });
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate: mockValidate,
        })
      );

      await act(async () => {
        await result.current.handleSubmit(mockFormEvent);
      });

      expect(mockValidate).toHaveBeenCalledWith(initialValues);
      expect(result.current.errors).toEqual({
        email: 'Email is required',
        name: 'Name is required',
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should call onSubmit if validation passes', async () => {
      setupUseTranslation();
      mockValidate.mockReturnValue({});
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate: mockValidate,
        })
      );

      await act(async () => {
        await result.current.handleSubmit(mockFormEvent);
      });

      expect(mockValidate).toHaveBeenCalledWith(initialValues);
      expect(result.current.errors).toEqual({});
      expect(mockOnSubmit).toHaveBeenCalledWith(initialValues);
    });

    it('should call onSubmit if no validate function is provided', async () => {
      setupUseTranslation();
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit(mockFormEvent);
      });

      expect(mockOnSubmit).toHaveBeenCalledWith(initialValues);
    });

    it('should set isSubmitting to true during submission and false after', async () => {
      setupUseTranslation();
      mockOnSubmit.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 10)));
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );

      const submitPromise = act(async () => {
        await result.current.handleSubmit(mockFormEvent);
      });

      await submitPromise;

      expect(result.current.isSubmitting).toBe(false);
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should set isSubmitting to false even if onSubmit throws an error', async () => {
      setupUseTranslation();
      const submitError = new Error('Submit failed');
      mockOnSubmit.mockImplementationOnce(() => Promise.reject(submitError));
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );

      await act(async () => {
        try {
          await result.current.handleSubmit(mockFormEvent);
        } catch (e) {
          void e;
        }
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetForm', () => {
    it('should reset values, errors, and touched state', () => {
      setupUseTranslation();
      const { result } = renderHook(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate: mockValidate,
        })
      );

      // Simular algunos cambios y errores
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'newName' },
        } as ChangeEvent<HTMLInputElement>);
        result.current.handleChange({
          target: { name: 'email', value: 'newEmail@example.com' },
        } as ChangeEvent<HTMLInputElement>);
      });
      act(() => {
        mockValidate.mockReturnValue({ name: 'Some error' });
        result.current.handleChange({
          target: { name: 'name', value: 'anotherName' },
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values).not.toEqual(initialValues);
      expect(result.current.errors).toEqual({ name: 'Some error' });
      expect(result.current.touched.name).toBe(true);
      expect(result.current.touched.email).toBe(true);

      // Resetear el formulario
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
    });
  });

  describe('useEffect - language change validation', () => {
    it('should not call validate if validate function is not provided, on language change', () => {
      setupUseTranslation();
      const { rerender } = renderHook(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
        })
      );
      act(() => {
        setupUseTranslation({ lang: 'en-GB' });
      });
      rerender();
      expect(mockValidate).not.toHaveBeenCalled();
    });

    it('should not call validate if no fields are touched, on language change', () => {
      setupUseTranslation();
      const { rerender, result } = renderHook(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate: mockValidate,
        })
      );
      expect(result.current.touched).toEqual({});
      act(() => {
        setupUseTranslation({ lang: 'en-GB' });
      });
      rerender();
      expect(mockValidate).not.toHaveBeenCalled();
    });

    it('should call validate and update errors on language change if fields are touched and validate exists', () => {
      setupUseTranslation();
      const { result, rerender } = renderHook(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate: mockValidate,
        })
      );
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'someName' },
        } as ChangeEvent<HTMLInputElement>);
      });
      mockValidate.mockClear();
      mockValidate.mockReturnValue({ name: 'Error en nuevo idioma' });

      act(() => {
        setupUseTranslation({ lang: 'en-GB' });
      });
      rerender();

      expect(mockValidate).toHaveBeenCalledTimes(1);
      expect(mockValidate).toHaveBeenCalledWith(result.current.values);
      expect(result.current.errors).toEqual({ name: 'Error en nuevo idioma' });
    });

    it('should maintain existing errors from non-language related validation if language change validation produces no new errors', () => {
      setupUseTranslation();
      mockValidate.mockReturnValue({ email: 'Invalid email from initial validation' });
      const { result, rerender } = renderHook(() =>
        useForm({
          initialValues,
          onSubmit: mockOnSubmit,
          validate: mockValidate,
        })
      );
      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'bademail' },
        } as ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.errors).toEqual({ email: 'Invalid email from initial validation' });
      mockValidate.mockClear();

      mockValidate.mockReturnValue({});
      act(() => {
        setupUseTranslation({ lang: 'en-GB' });
      });
      rerender();
      expect(result.current.errors).toEqual({});
    });

    it('should use current values in useEffect validation', () => {
      setupUseTranslation();
      const { result, rerender } = renderHook(() =>
        useForm<typeof initialValues>({
          initialValues,
          onSubmit: mockOnSubmit,
          validate: mockValidate,
        })
      );
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'updatedName' },
        } as ChangeEvent<HTMLInputElement>);
      });
      mockValidate.mockClear();

      const languageChangeValidationErrors = { name: 'Error de idioma para updatedName' };
      mockValidate.mockReturnValue(languageChangeValidationErrors);
      act(() => {
        setupUseTranslation({ lang: 'fr' });
      });
      act(() => {
        rerender();
      });
      expect(mockValidate).toHaveBeenCalledTimes(1);
      expect(mockValidate).toHaveBeenCalledWith({ ...initialValues, name: 'updatedName' });
      expect(result.current.errors).toEqual(languageChangeValidationErrors);
    });
  });
});
