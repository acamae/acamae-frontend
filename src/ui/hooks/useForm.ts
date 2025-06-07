import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type UseFormConfig<T> = {
  initialValues: T;
  onSubmit: (values: T) => void;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
};

export type UseFormReturn<T> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (config: UseFormConfig<T>) => (e: React.FormEvent) => void;
  isSubmitting?: boolean;
};

export const useForm = <T extends object>({
  initialValues,
  onSubmit,
  validate,
}: UseFormConfig<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const { i18n } = useTranslation();

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

    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
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
    isSubmitting,
    touched,
    handleChange,
    handleSubmit,
    resetForm,
  };
};
