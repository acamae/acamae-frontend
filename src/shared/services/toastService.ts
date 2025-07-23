import { ToastOptions } from '@domain/types/toast';

/**
 * Servicio centralizado de toast para la aplicación.
 * Abstrae la implementación específica del proveedor de toast.
 */
class ToastService {
  private toastApi: {
    error: (message: string, title?: string, options?: Partial<ToastOptions>) => void;
    success: (message: string, title?: string, options?: Partial<ToastOptions>) => void;
    warning: (message: string, title?: string, options?: Partial<ToastOptions>) => void;
    info: (message: string, title?: string, options?: Partial<ToastOptions>) => void;
    show: (options: ToastOptions) => void;
  } | null = null;

  /**
   * Configura el servicio de toast con una implementación real.
   * Debe ser llamado una vez durante la inicialización de la aplicación.
   */
  configure(toastApi: {
    error: (message: string, title?: string, options?: Partial<ToastOptions>) => void;
    success: (message: string, title?: string, options?: Partial<ToastOptions>) => void;
    warning: (message: string, title?: string, options?: Partial<ToastOptions>) => void;
    info: (message: string, title?: string, options?: Partial<ToastOptions>) => void;
    show: (options: ToastOptions) => void;
  }): void {
    this.toastApi = toastApi;
  }

  /**
   * Inicializa el sistema de toast.
   * Debe ser llamado una vez al iniciar la aplicación.
   */
  initialize(): void {
    // Inicialización específica del proveedor de toast si es necesario
  }

  /**
   * Muestra un mensaje de error.
   */
  error(message: string, title?: string, options?: Partial<ToastOptions>): void {
    if (this.toastApi) {
      this.toastApi.error(message, title, options);
    } else {
      console.error(`[TOAST ERROR] ${message}`);
    }
  }

  /**
   * Muestra un mensaje de éxito.
   */
  success(message: string, title?: string, options?: Partial<ToastOptions>): void {
    if (this.toastApi) {
      this.toastApi.success(message, title, options);
    } else {
      console.info(`[TOAST SUCCESS] ${message}`);
    }
  }

  /**
   * Muestra un mensaje de advertencia.
   */
  warning(message: string, title?: string, options?: Partial<ToastOptions>): void {
    if (this.toastApi) {
      this.toastApi.warning(message, title, options);
    } else {
      console.warn(`[TOAST WARNING] ${message}`);
    }
  }

  /**
   * Muestra un mensaje informativo.
   */
  info(message: string, title?: string, options?: Partial<ToastOptions>): void {
    if (this.toastApi) {
      this.toastApi.info(message, title, options);
    } else {
      console.info(`[TOAST INFO] ${message}`);
    }
  }

  /**
   * Muestra un mensaje personalizado.
   */
  show(options: ToastOptions): void {
    if (this.toastApi) {
      this.toastApi.show(options);
    } else {
      const message =
        typeof options === 'object' && options && 'message' in options
          ? (options as { message: string }).message
          : 'Custom message';
      console.log(`[TOAST] ${message}`);
    }
  }
}

export const toastService = new ToastService();
