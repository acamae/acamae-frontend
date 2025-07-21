import { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
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
  handleSubmit: (e: React.FormEvent) => void;
  // Throttling properties
  isThrottled?: boolean;
  timeUntilNextSubmission?: number;
  remainingAttempts?: number;
  resetThrottle?: () => void;
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
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const { i18n } = useTranslation();

  // Ref to track component mount status
  const isMountedRef = useRef(true);

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

  // Cleanup effect to handle component unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Run validation only when the language changes and only for touched fields
  useEffect(() => {
    const validationErrors =
      validate && Object.keys(touched).length > 0 ? validate(values) || {} : {};
    setErrors(validationErrors);
  }, [i18n.language, validate, values, touched]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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

    const validationErrors = validate ? validate({ ...values, [name]: value }) || {} : {};
    setErrors(validationErrors);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setValues(prev => ({ ...prev, [name]: checked }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    // Solo llamar a throttledSubmit o onSubmit, sin setIsSubmitting
    if (shouldUseThrottling && throttledSubmit) {
      await throttledSubmit.handleThrottledSubmit();
    } else {
      await onSubmit(values);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    resetForm,
    // Throttling properties (siempre disponibles con defaults)
    isThrottled: shouldUseThrottling && throttledSubmit ? throttledSubmit.isThrottled : false,
    timeUntilNextSubmission:
      shouldUseThrottling && throttledSubmit ? throttledSubmit.timeUntilNextSubmission : 0,
    remainingAttempts:
      shouldUseThrottling && throttledSubmit ? throttledSubmit.remainingAttempts : 0,
    resetThrottle:
      shouldUseThrottling && throttledSubmit ? throttledSubmit.resetThrottle : () => {},
  };
};
