import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ToastOptions } from '@domain/types/toast';
import { toastService } from '@shared/services/toastService';

/**
 * Hook que proporciona funcionalidad de toast con soporte para i18n.
 * Utiliza toastService internamente y traduce automáticamente las claves.
 */
export const useToast = () => {
  const { t } = useTranslation();

  /**
   * Inicializa el sistema de toast.
   */
  const initialize = useCallback(() => {
    toastService.initialize();
  }, []);

  /**
   * Muestra un mensaje de error.
   * Si el mensaje es una clave de traducción, la traduce automáticamente.
   */
  const error = useCallback(
    (message: string, title?: string, _options?: Partial<ToastOptions>) => {
      const translatedMessage = title ? `${t(title)}: ${t(message)}` : t(message);
      toastService.error(translatedMessage);
    },
    [t]
  );

  /**
   * Muestra un mensaje de éxito.
   * Si el mensaje es una clave de traducción, la traduce automáticamente.
   */
  const success = useCallback(
    (message: string, title?: string, _options?: Partial<ToastOptions>) => {
      const translatedMessage = title ? `${t(title)}: ${t(message)}` : t(message);
      toastService.success(translatedMessage);
    },
    [t]
  );

  /**
   * Muestra un mensaje de advertencia.
   * Si el mensaje es una clave de traducción, la traduce automáticamente.
   */
  const warning = useCallback(
    (message: string, title?: string, _options?: Partial<ToastOptions>) => {
      const translatedMessage = title ? `${t(title)}: ${t(message)}` : t(message);
      toastService.warning(translatedMessage);
    },
    [t]
  );

  /**
   * Muestra un mensaje informativo.
   * Si el mensaje es una clave de traducción, la traduce automáticamente.
   */
  const info = useCallback(
    (message: string, title?: string, _options?: Partial<ToastOptions>) => {
      const translatedMessage = title ? `${t(title)}: ${t(message)}` : t(message);
      toastService.info(translatedMessage);
    },
    [t]
  );

  /**
   * Muestra un mensaje personalizado.
   * Si el mensaje es una clave de traducción, la traduce automáticamente.
   */
  const show = useCallback(
    (options: ToastOptions) => {
      const translatedMessage = options.title
        ? `${t(options.title)}: ${t(options.message)}`
        : t(options.message);
      toastService.show(translatedMessage);
    },
    [t]
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
