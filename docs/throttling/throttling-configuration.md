# Throttling Configuration

## Overview

El sistema de throttling de Acamae Frontend previene ataques DDoS y abuso de formularios mediante la limitación de intentos de envío. La configuración se maneja a través de variables de entorno.

## Variables de Entorno Disponibles

### Variables Principales

| Variable                      | Descripción                                 | Valor por Defecto | Ejemplo  |
| ----------------------------- | ------------------------------------------- | ----------------- | -------- |
| `REACT_THROTTLE_DELAY_MS`     | Tiempo de espera entre intentos (ms)        | `4000`            | `2000`   |
| `REACT_THROTTLE_MAX_ATTEMPTS` | Número máximo de intentos permitidos        | `10`              | `5`      |
| `REACT_THROTTLE_WINDOW_MS`    | Ventana de tiempo para contar intentos (ms) | `300000` (5 min)  | `600000` |

### Configuraciones por Tipo

#### Formularios de Autenticación (AUTH_FORMS)

- **Delay**: 4 segundos entre intentos
- **Max Attempts**: 10 intentos
- **Time Window**: 5 minutos
- **Persistencia**: Habilitada (localStorage)

#### Formularios Regulares (REGULAR_FORMS)

- **Delay**: 4 segundos entre intentos
- **Max Attempts**: 10 intentos
- **Time Window**: 5 minutos
- **Persistencia**: Deshabilitada

#### Acciones Críticas (CRITICAL_ACTIONS)

- **Delay**: 4 segundos entre intentos
- **Max Attempts**: 10 intentos
- **Time Window**: 5 minutos
- **Persistencia**: Habilitada (localStorage)

## Manejo de Variables de Entorno

### Función `getEnvVar`

La función `getEnvVar` maneja de forma segura las variables de entorno:

```typescript
const getEnvVar = (key: string, defaultValue: string): number => {
  try {
    const envValue = process.env[key];
    // Verifica que la variable existe, no es undefined, null o string vacío
    if (envValue !== undefined && envValue !== null && envValue !== '') {
      return Number(envValue);
    }
    return Number(defaultValue);
  } catch {
    return Number(defaultValue);
  }
};
```

### Comportamiento

- **Variable definida con valor válido**: Usa el valor de la variable
- **Variable undefined/null**: Usa el valor por defecto
- **Variable con string vacío**: Usa el valor por defecto (NO retorna 0)
- **Error en acceso a process.env**: Usa el valor por defecto

## Ejemplos de Configuración

### Configuración Estricta (Desarrollo)

```bash
REACT_THROTTLE_DELAY_MS=1000
REACT_THROTTLE_MAX_ATTEMPTS=3
REACT_THROTTLE_WINDOW_MS=60000
```

### Configuración Permisiva (Testing)

```bash
REACT_THROTTLE_DELAY_MS=0
REACT_THROTTLE_MAX_ATTEMPTS=1000
REACT_THROTTLE_WINDOW_MS=0
```

### Configuración de Producción

```bash
REACT_THROTTLE_DELAY_MS=4000
REACT_THROTTLE_MAX_ATTEMPTS=10
REACT_THROTTLE_WINDOW_MS=300000
```

## Casos de Uso

### Deshabilitar Throttling

Para deshabilitar completamente el throttling, establece:

```bash
REACT_THROTTLE_DELAY_MS=0
REACT_THROTTLE_MAX_ATTEMPTS=999999
REACT_THROTTLE_WINDOW_MS=0
```

### Throttling Muy Estricto

Para máxima seguridad:

```bash
REACT_THROTTLE_DELAY_MS=10000
REACT_THROTTLE_MAX_ATTEMPTS=3
REACT_THROTTLE_WINDOW_MS=900000
```

## Persistencia

### Formularios con Persistencia

- Login
- Registro
- Recuperación de contraseña
- Reset de contraseña
- Reenvío de verificación de email
- Acciones críticas

### Formularios sin Persistencia

- Formularios regulares (mejor UX)

## Testing

Durante las pruebas (`NODE_ENV=test`), el throttling se deshabilita automáticamente para permitir tests más rápidos y predecibles.

## Archivos Relacionados

- `src/shared/utils/securityUtils.ts`: Implementación del servicio de throttling
- `src/shared/constants/security.ts`: Configuraciones predefinidas
- `src/shared/utils/__tests__/securityUtils.test.ts`: Tests del sistema de throttling

## Migración

### Cambios Recientes

1. **Nombres de variables unificados**: Todas las variables ahora usan el prefijo `REACT_THROTTLE_*`
2. **Manejo mejorado de strings vacíos**: Los strings vacíos ahora usan valores por defecto en lugar de 0
3. **Configuraciones consistentes**: Todos los archivos usan los mismos nombres de variables

### Variables Obsoletas

Las siguientes variables ya no se usan:

- `REACT_APP_THROTTLE_DELAY_DEFAULT`
- `REACT_APP_THROTTLE_MAX_ATTEMPTS_DEFAULT`
- `REACT_APP_THROTTLE_TIME_WINDOW_DEFAULT`
