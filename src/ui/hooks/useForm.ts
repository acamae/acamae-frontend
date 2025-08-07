import { useState, ChangeEvent, FormEvent, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ThrottleConfig } from '@shared/constants/security';
import { useThrottledSubmit } from '@ui/hooks/useThrottledSubmit';

export type UseFormConfig<T> = {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  enableThrottling?: boolean;
  formName?: string;
  throttleConfig?: Partial<ThrottleConfig>;
};

export type UseFormReturn<T> = {
  values: T;
  errors: Partial<Record<keyof T, string | React.ReactNode>>;
  touched: Partial<Record<keyof T, boolean>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  hasValidationErrors: boolean;
  isFormValid: boolean;
  // Throttling properties
  isThrottled?: boolean;
  timeUntilNextSubmission?: number;
  remainingAttempts?: number;
  resetThrottle?: () => void;
  activateThrottle?: () => void;
};

export const useForm = <T extends object>({
  initialValues,
  onSubmit,
  validate,
  enableThrottling = false,
  formName = 'default-form',
  throttleConfig,
}: UseFormConfig<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string | React.ReactNode>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const { i18n } = useTranslation();

  // AbortController ref to handle component unmounting during submission
  const abortControllerRef = useRef<AbortController | null>(null);

  const shouldUseThrottling = enableThrottling && formName;

  // Throttling functionality - always call the hook
  const throttledSubmit = useThrottledSubmit({
    formName: shouldUseThrottling ? formName : 'disabled',
    throttleConfig: shouldUseThrottling ? throttleConfig : undefined,
    onSubmit: async () => {
      if (shouldUseThrottling) {
        await onSubmit(values);
      }
    },
    showToastOnThrottle: !!shouldUseThrottling,
  });

  // Cleanup effect to abort any pending submission on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Run validation only when the language changes
  useEffect(() => {
    // Only re-validate if there are existing errors and the language changed
    if (Object.keys(errors).length > 0 && validate) {
      const validationErrors = validate(values) || {};
      setErrors(validationErrors);
    }
  }, [i18n.language, validate, values]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update values
    setValues(
      prev =>
        ({
          ...prev,
          [name]: value,
        }) as T
    );

    // Set the field as touched
    setTouched(
      prev =>
        ({
          ...prev,
          [name]: true,
        }) as Record<keyof T, boolean>
    );

    // Don't clear errors here to prevent flickering
    // Errors will be cleared in handleBlur when the field becomes valid
  }, []);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name } = e.target;

      // Set the field as touched
      setTouched(
        prev =>
          ({
            ...prev,
            [name]: true,
          }) as Record<keyof T, boolean>
      );

      // Validate the field on blur
      if (validate) {
        const validationErrors = validate(values) || {};

        // Only update errors if there are changes to prevent unnecessary re-renders
        setErrors(prev => {
          const currentFieldError = prev[name as keyof T];
          const newFieldError = validationErrors[name as keyof T];

          // If the error for this field hasn't changed, return the same object
          if (currentFieldError === newFieldError) {
            return prev;
          }

          // If the field is now valid (no error), clear it
          if (!newFieldError && currentFieldError) {
            const newErrors = { ...prev };
            delete newErrors[name as keyof T];
            return newErrors;
          }

          // If there's a new error or the error changed, update it
          if (newFieldError !== currentFieldError) {
            return { ...prev, [name]: newFieldError };
          }

          return prev;
        });
      }
    },
    [validate, values]
  );

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setValues(prev => ({ ...prev, [name]: checked }));
      setTouched(prev => ({ ...prev, [name]: true }));

      // For checkboxes, validate immediately since they're binary
      if (validate) {
        const validationErrors = validate({ ...values, [name]: checked }) || {};
        setErrors(validationErrors);
      }
    },
    [validate, values]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Prevent multiple simultaneous submissions
      if (isSubmitting) {
        return;
      }

      // Set all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      );
      setTouched(allTouched);

      const validationErrors = validate ? validate(values) || {} : {};
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);

      // Create a new AbortController for this submission
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        if (shouldUseThrottling && throttledSubmit) {
          await throttledSubmit.handleThrottledSubmit();
          // Don't reset throttle on success - let it maintain its state
        } else {
          await onSubmit(values);
        }
      } catch (error) {
        // Check if the operation was aborted (component unmounted)
        if (controller.signal.aborted) {
          return; // Don't handle error or reset state if aborted
        }
        // Handle error normally if not aborted
        console.error('Form submission error:', error);
      } finally {
        // Only reset isSubmitting if the operation wasn't aborted
        if (!controller.signal.aborted) {
          setIsSubmitting(false);
        }
      }
    },
    [isSubmitting, values, validate, shouldUseThrottling, throttledSubmit, onSubmit]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  const hasValidationErrors = useMemo(
    () =>
      Object.keys(errors).some(
        key => touched[key as keyof typeof touched] && Boolean(errors[key as keyof typeof errors])
      ),
    [errors, touched]
  );
  // Check if form is valid (no errors and all required fields are filled)
  const isFormValid = useMemo(() => {
    if (hasValidationErrors) return false;

    return Object.keys(values).every(key => {
      const value = values[key as keyof T];
      // Consider empty strings, null, undefined as invalid
      return value !== '' && value !== null && value !== undefined;
    });
  }, [hasValidationErrors, values]);

  return {
    values,
    errors,
    isSubmitting,
    touched,
    handleChange,
    handleCheckboxChange,
    handleBlur,
    handleSubmit,
    resetForm,
    hasValidationErrors,
    isFormValid,
    // Throttling properties (always available with defaults)
    isThrottled: shouldUseThrottling && throttledSubmit ? throttledSubmit.isThrottled : false,
    timeUntilNextSubmission:
      shouldUseThrottling && throttledSubmit ? throttledSubmit.timeUntilNextSubmission : 0,
    remainingAttempts:
      shouldUseThrottling && throttledSubmit ? throttledSubmit.remainingAttempts : 0,
    resetThrottle:
      shouldUseThrottling && throttledSubmit ? throttledSubmit.resetThrottle : () => {},
    activateThrottle: throttledSubmit?.activateThrottle,
  };
};
