/**
 * Servicio centralizado de toast para la aplicación.
 * Abstrae la implementación específica del proveedor de toast.
 */
class ToastService {
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
  error(message: string): void {
    console.error(`[TOAST ERROR] ${message}`);
    // Implementación real con la biblioteca de toast
  }

  /**
   * Muestra un mensaje de éxito.
   */
  success(message: string): void {
    console.info(`[TOAST SUCCESS] ${message}`);
    // Implementación real con la biblioteca de toast
  }

  /**
   * Muestra un mensaje de advertencia.
   */
  warning(message: string): void {
    console.warn(`[TOAST WARNING] ${message}`);
    // Implementación real con la biblioteca de toast
  }

  /**
   * Muestra un mensaje informativo.
   */
  info(message: string): void {
    console.info(`[TOAST INFO] ${message}`);
    // Implementación real con la biblioteca de toast
  }

  /**
   * Muestra un mensaje personalizado.
   */
  show(message: string): void {
    console.log(`[TOAST] ${message}`);
    // Implementación real con la biblioteca de toast
  }
}

export const toastService = new ToastService();
