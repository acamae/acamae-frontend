import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ToastOptions } from '@domain/types/toast';
import { useToastContext } from '@shared/services/ToastProvider';

/**
 * Hook que proporciona funcionalidad de toast con soporte para i18n.
 * Utiliza el contexto del ToastProvider para mostrar toasts reales.
 */
export const useToast = () => {
  const { t } = useTranslation();
  const toastContext = useToastContext();

  /**
   * Inicializa el sistema de toast.
   */
  const initialize = useCallback(() => {
    // No es necesario inicializar nada ya que el ToastProvider ya está configurado
  }, []);

  /**
   * Muestra un mensaje de error.
   * Si el mensaje es una clave de traducción, la traduce automáticamente.
   */
  const error = useCallback(
    (message: string, title?: string, options?: Partial<ToastOptions>) => {
      const translatedMessage = t(message);
      const translatedTitle = title ? t(title) : undefined;
      toastContext.error(translatedMessage, translatedTitle, options);
    },
    [t, toastContext]
  );

  /**
   * Muestra un mensaje de éxito.
   * Si el mensaje es una clave de traducción, la traduce automáticamente.
   */
  const success = useCallback(
    (message: string, title?: string, options?: Partial<ToastOptions>) => {
      const translatedMessage = t(message);
      const translatedTitle = title ? t(title) : undefined;
      toastContext.success(translatedMessage, translatedTitle, options);
    },
    [t, toastContext]
  );

  /**
   * Muestra un mensaje de advertencia.
   * Si el mensaje es una clave de traducción, la traduce automáticamente.
   */
  const warning = useCallback(
    (message: string, title?: string, options?: Partial<ToastOptions>) => {
      const translatedMessage = t(message);
      const translatedTitle = title ? t(title) : undefined;
      toastContext.warning(translatedMessage, translatedTitle, options);
    },
    [t, toastContext]
  );

  /**
   * Muestra un mensaje informativo.
   * Si el mensaje es una clave de traducción, la traduce automáticamente.
   */
  const info = useCallback(
    (message: string, title?: string, options?: Partial<ToastOptions>) => {
      const translatedMessage = t(message);
      const translatedTitle = title ? t(title) : undefined;
      toastContext.info(translatedMessage, translatedTitle, options);
    },
    [t, toastContext]
  );

  /**
   * Muestra un mensaje personalizado.
   * Si el mensaje es una clave de traducción, la traduce automáticamente.
   */
  const show = useCallback(
    (options: ToastOptions) => {
      const translatedOptions: ToastOptions = {
        ...options,
        message: t(options.message),
        title: options.title ? t(options.title) : undefined,
      };
      toastContext.show(translatedOptions);
    },
    [t, toastContext]
  );

  return {
    initialize,
    error,
    success,
    warning,
    info,
    show,
  };
};

export default useToast;
