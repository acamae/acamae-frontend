let sessionTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Reinicia el temporizador de sesión y ejecuta un callback tras el retraso especificado.
 * Útil para implementar cierre de sesión automático por inactividad.
 * @param callback Función a ejecutar cuando expira el temporizador
 * @param delay Tiempo en milisegundos antes de ejecutar el callback (por defecto 5000ms)
 */
export function resetSessionTimer(callback: () => void, delay: number = 5000) {
  if (sessionTimeout) {
    clearTimeout(sessionTimeout);
  }
  sessionTimeout = setTimeout(callback, delay);
}

/**
 * Limpia el temporizador de sesión actual, evitando la ejecución del callback.
 */
export function clearSessionTimer() {
  if (sessionTimeout) {
    clearTimeout(sessionTimeout);
    sessionTimeout = null;
  }
}
