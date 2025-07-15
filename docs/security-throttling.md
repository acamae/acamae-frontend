# Seguridad Anti-DDoS: Sistema de Throttling

## Descripción General

El sistema de throttling implementado en el frontend proporciona protección contra ataques DDoS al limitar la frecuencia de las submissions de formularios. Esta funcionalidad previene que usuarios malintencionados o scripts automatizados realicen múltiples solicitudes rápidas que podrían sobrecargar el servidor.

## Características Principales

### 1. Throttling por Formulario

- **Delay mínimo**: Tiempo mínimo entre submissions
- **Límite de intentos**: Número máximo de submissions en una ventana de tiempo
- **Bloqueo temporal**: Bloqueo automático después de exceder el límite

### 2. Configuraciones Predefinidas

#### Formularios de Autenticación (`AUTH_FORMS`)

```typescript
{
  delay: 4000,        // 4 segundos mínimo entre clics
  maxAttempts: 3,     // 3 intentos máximos
  timeWindow: 60000   // en 1 minuto
}
```

#### Formularios Regulares (`REGULAR_FORMS`)

```typescript
{
  delay: 2000,        // 2 segundos mínimo entre clics
  maxAttempts: 5,     // 5 intentos máximos
  timeWindow: 60000   // en 1 minuto
}
```

#### Acciones Críticas (`CRITICAL_ACTIONS`)

```typescript
{
  delay: 8000,        // 8 segundos mínimo entre clics
  maxAttempts: 2,     // 2 intentos máximos
  timeWindow: 60000   // en 1 minuto
}
```

## Implementación

### 1. Servicio de Throttling

```typescript
// src/shared/utils/securityUtils.ts
import { securityThrottleService } from '@shared/utils/securityUtils';
import { THROTTLE_CONFIGS } from '@shared/constants/security';

// Verificar si una acción está permitida
const canPerform = securityThrottleService.canPerformAction('form-name-submit', config);

// Obtener tiempo restante hasta próxima acción
const timeRemaining = securityThrottleService.getTimeUntilNextAction('form-name-submit', config);

// Obtener intentos restantes
const remaining = securityThrottleService.getRemainingAttempts('form-name-submit', config);

// Limpiar estado de throttling
securityThrottleService.clearThrottleState('form-name-submit');

// Limpiar persistencia completa (desarrollo)
securityThrottleService.clearPersistedStates();
```

#### Persistencia Automática

El servicio automáticamente:

- **Carga estados** desde localStorage al inicializar
- **Persiste cambios** para configuraciones con `persistInClient: true`
- **Limpia estados expirados** (> 5 minutos)
- **Maneja errores** de storage corrupto

### 2. Hook useThrottledSubmit

```typescript
// Uso básico
const throttledSubmit = useThrottledSubmit({
  formName: 'login-form',
  onSubmit: async () => {
    // Lógica de envío
  },
  showToastOnThrottle: true,
});

// Hooks especializados
const authThrottle = useAuthThrottledSubmit('login-form', onSubmit);
const regularThrottle = useRegularThrottledSubmit('contact-form', onSubmit);
const criticalThrottle = useCriticalThrottledSubmit('delete-account', onSubmit);
```

### 3. Integración con useForm

```typescript
const {
  values,
  errors,
  handleSubmit,
  isSubmitting,
  isThrottled,
  canSubmit,
  timeUntilNextSubmission,
} = useForm({
  initialValues: { email: '', password: '' },
  validate,
  onSubmit: async data => {
    await login(data);
  },
  enableThrottling: true,
  formName: 'login-form',
});
```

## Formularios Actualizados

Los siguientes formularios han sido actualizados para incluir protección anti-DDoS:

### 1. LoginForm

- **Configuración**: `AUTH_FORMS`
- **Nombre**: `login-form`
- **Protección**: 4 segundos entre intentos, máximo 3 intentos en 1 minuto

### 2. RegisterForm

- **Configuración**: `AUTH_FORMS`
- **Nombre**: `register-form`
- **Protección**: 4 segundos entre intentos, máximo 3 intentos en 1 minuto

### 3. ForgotPasswordForm

- **Configuración**: `AUTH_FORMS`
- **Nombre**: `forgot-password-form`
- **Protección**: 4 segundos entre intentos, máximo 3 intentos en 1 minuto

### 4. ResetPasswordForm

- **Configuración**: `AUTH_FORMS`
- **Nombre**: `reset-password-form`
- **Protección**: 4 segundos entre intentos, máximo 3 intentos en 1 minuto

### 5. ResendVerificationForm

- **Configuración**: `AUTH_FORMS`
- **Nombre**: `email-verification-resend-form`
- **Protección**: 4 segundos entre intentos, máximo 3 intentos en 1 minuto

## Experiencia de Usuario

### Comportamiento del Botón

- **Estado normal**: Botón disponible para clic
- **Estado throttled**: Botón deshabilitado con contador de tiempo
- **Estado bloqueado**: Botón deshabilitado con mensaje de error

### Ejemplos de Texto del Botón

- Normal: "Iniciar sesión"
- Throttled: "Iniciar sesión (3s)"
- Bloqueado: Botón deshabilitado + toast de error

### Mensajes de Retroalimentación

#### Mensajes de Advertencia (Warning Toast)

- **Español**: "Por favor, espera 3 segundos antes de intentar nuevamente."
- **Inglés**: "Please wait 3 seconds before trying again."

#### Mensajes de Error (Error Toast)

- **Español**: "Demasiados intentos. Inténtalo de nuevo en 5 minutos."
- **Inglés**: "Too many attempts. Try again in 5 minutes."

## Internacionalización

### Claves de Traducción

```json
{
  "security": {
    "throttle": {
      "wait": "Por favor, espera {{seconds}} segundos antes de intentar nuevamente.",
      "blocked": "Demasiados intentos. Inténtalo de nuevo en {{minutes}} minutos.",
      "rate_limit_exceeded": "Límite de velocidad excedido. Inténtalo más tarde."
    }
  }
}
```

## Testing

### Tests de Seguridad

- **Unidad**: Tests para `securityThrottleService`
- **Integración**: Tests para `useThrottledSubmit`
- **E2E**: Tests de Cypress para verificar comportamiento en formularios

### Cobertura de Tests

- ✅ Throttling por delay mínimo
- ✅ Límite de intentos máximos
- ✅ Reset de ventana de tiempo
- ✅ Bloqueo y desbloqueo automático
- ✅ Mensajes de retroalimentación
- ✅ Integración con formularios

## Configuración Personalizada

### Crear Configuración Personalizada

```typescript
const customConfig = {
  delay: 5000, // 5 segundos
  maxAttempts: 2, // 2 intentos
  timeWindow: 120000, // 2 minutos
};

const customThrottle = useThrottledSubmit({
  formName: 'custom-form',
  throttleConfig: customConfig,
  onSubmit: handleSubmit,
});
```

### Deshabilitar Throttling

```typescript
const form = useForm({
  // ... otras configuraciones
  enableThrottling: false, // Deshabilitar throttling
});
```

## Consideraciones de Rendimiento

### Memoria

- El servicio mantiene un `Map` con los estados de throttling
- Limpieza automática después de las ventanas de tiempo
- Método `clearAllThrottleStates()` para limpieza manual

### Temporizadores

- Uso de `setInterval` para actualizar el tiempo restante
- Limpieza automática de intervalos al desmontar componentes
- Uso de `setTimeout` para desbloqueo automático

## Monitoreo y Debugging

### Logs de Desarrollo

```typescript
// Verificar estado de throttling
console.log(securityThrottleService.getThrottleState('form-name-submit'));

// Verificar tiempo restante
console.log(securityThrottleService.getTimeUntilNextAction('form-name-submit'));
```

### Métricas Recomendadas

- Número de intentos throttled por formulario
- Tiempo promedio entre submissions
- Usuarios bloqueados por exceso de intentos
- Efectividad del throttling en reducir carga del servidor

## Mejores Prácticas

1. **Configuraciones Apropiadas**: Usar configuraciones más estrictas para formularios críticos
2. **Feedback Claro**: Mostrar mensajes informativos al usuario
3. **Accesibilidad**: Mantener atributos ARIA apropiados en botones deshabilitados
4. **Testing**: Probar escenarios de throttling en tests automatizados
5. **Monitoreo**: Implementar logging para detectar patrones de uso malicioso

## Persistencia en Cliente

### Configuraciones Persistentes

Para **AUTH_FORMS** y **CRITICAL_ACTIONS**, el throttling se persiste en `localStorage` para prevenir bypass mediante refresh:

```typescript
// Configuraciones que persisten en cliente
AUTH_FORMS: {
  delay: 4000,
  maxAttempts: 3,
  timeWindow: 60000,
  persistInClient: true // ✅ Persiste en localStorage
}

CRITICAL_ACTIONS: {
  delay: 8000,
  maxAttempts: 2,
  timeWindow: 60000,
  persistInClient: true // ✅ Persiste en localStorage
}

REGULAR_FORMS: {
  delay: 2000,
  maxAttempts: 5,
  timeWindow: 60000,
  persistInClient: false // ❌ No persiste (mejor UX)
}
```

### Características de la Persistencia

- **Clave de Storage**: `acamae-throttle-states`
- **Expiración**: Estados se limpian automáticamente después de 5 minutos
- **Tolerancia a Errores**: Storage corrupto se limpia automáticamente
- **Seguridad**: Solo formularios críticos persisten

### Limpieza Manual del Storage

Para desarrollo/debugging:

```javascript
// Limpiar throttling storage completamente
securityThrottleService.clearPersistedStates();

// O directamente en consola
localStorage.removeItem('acamae-throttle-states');
```

## Limitaciones y Consideraciones

### Limitaciones del Frontend

- **Bypass Avanzado**: Usuarios técnicos pueden limpiar localStorage manualmente
- **Complemento**: Debe complementarse con throttling en el backend
- **Persistencia Selectiva**: Solo AUTH_FORMS y CRITICAL_ACTIONS persisten

### Recomendaciones Adicionales

- Implementar rate limiting en el backend
- Usar CAPTCHA para usuarios con comportamiento sospechoso
- Monitorear patrones de tráfico a nivel de red
- Considerar implementar Web Application Firewall (WAF)

## Roadmap Futuro

### Mejoras Planeadas

- [ ] Persistencia de estados en localStorage
- [ ] Integración con analytics para detectar patrones
- [ ] Configuraciones dinámicas desde el backend
- [ ] Throttling adaptativo basado en el rendimiento del servidor
- [ ] Whitelist de IPs o usuarios confiables

### Extensiones Posibles

- [ ] Throttling por IP address
- [ ] Throttling por sesión de usuario
- [ ] Integración con servicios de detección de bots
- [ ] Dashboard de monitoreo de seguridad
