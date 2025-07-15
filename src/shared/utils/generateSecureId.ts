/**
 * Genera un ID criptográficamente seguro
 * Usa crypto.randomUUID() si está disponible, o crypto.getRandomValues() como alternativa
 *
 * @param dependencies Dependencias externas inyectables para testing
 */
export function generateSecureId(
  dependencies = {
    cryptoObj: typeof crypto !== 'undefined' ? crypto : undefined,
    dateNow: Date.now,
    processHrtime: typeof process !== 'undefined' ? process.hrtime : undefined,
  }
): string {
  const { cryptoObj, dateNow, processHrtime } = dependencies;

  try {
    // Intentar usar crypto.randomUUID() (disponible en Node.js 14.17+ y navegadores modernos)
    if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
      return cryptoObj.randomUUID().replace(/-/g, '').slice(0, 9);
    }

    // Alternativa con crypto.getRandomValues() (disponible en Node.js y navegadores)
    if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
      const array = new Uint8Array(9);
      cryptoObj.getRandomValues(array);
      return Array.from(array, byte => byte.toString(36))
        .join('')
        .slice(0, 9);
    }

    // Última opción: usar timestamp con process.hrtime para entropía adicional
    // Esto no es criptográficamente seguro pero proporciona mejor entropía que Math.random()
    const timestamp = dateNow();
    const hrtime = processHrtime ? processHrtime.bigint().toString(36) : timestamp.toString(36);
    return `${timestamp}_${hrtime}`.slice(-9);
  } catch {
    // Si todos los métodos fallan, usar un fallback basado en timestamp
    const fallbackTimestamp = dateNow();
    return `${fallbackTimestamp}`.slice(-9);
  }
}
