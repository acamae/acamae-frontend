/**
 * Servicio de logs para la aplicación.
 * Proporciona métodos para registrar mensajes con diferentes niveles.
 * Puede extenderse para integrarse con servicios de monitoreo externos.
 */
class LogService {
  /**
   * Registra un mensaje de error
   */
  error(message: string, ...args: unknown[]): void {
    // En producción podría enviar a un servicio de monitoreo como Sentry
    console.error(`[ERROR] ${message}`, ...args);
  }

  /**
   * Registra un mensaje de advertencia
   */
  warn(message: string, ...args: unknown[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  /**
   * Registra un mensaje informativo
   */
  info(message: string, ...args: unknown[]): void {
    console.info(`[INFO] ${message}`, ...args);
  }

  /**
   * Registra un mensaje general
   */
  log(message: string, ...args: unknown[]): void {
    console.log(`[LOG] ${message}`, ...args);
  }
}

export const logService = new LogService();
