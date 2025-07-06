# Estructura de Respuestas de API - Especificación

## 🎯 **Objetivo**

Definir una estructura consistente y predecible para todas las respuestas de la API, tanto para casos exitosos como errores, que facilite el manejo en el frontend y proporcione información útil para debugging y trazabilidad.

## 📋 **Estructura Base**

### **Respuesta Exitosa**

```typescript
interface ApiSuccessResponse<T> {
  success: true;
  data: T | null; // Los datos solicitados
  status: number; // Código HTTP (200, 201, etc.)
  code: ApiSuccessCode; // 'SUCCESS'
  message: string; // Mensaje descriptivo
  timestamp?: string; // ISO 8601 timestamp
  requestId?: string; // ID único para trazabilidad
  meta?: Record<string, any>; // Metadatos (paginación, etc.)
}
```

### **Respuesta de Error**

```typescript
interface ApiErrorResponse<T> {
  success: false;
  data: T | null; // null en errores
  status: number; // Código HTTP (400, 401, 500, etc.)
  code: ApiErrorCode; // Código semántico de error
  message: string; // Mensaje de error legible
  timestamp?: string; // ISO 8601 timestamp
  requestId?: string; // ID único para trazabilidad
  meta?: Record<string, any>; // Metadatos adicionales
  error?: {
    // Detalles específicos del error
    type: 'validation' | 'network' | 'server' | 'authentication' | 'authorization' | 'business';
    details?: Array<{
      field: string;
      code: string;
      message: string;
    }>;
    stack?: string; // Solo en desarrollo
  };
}
```

## 🔧 **Manejo de Errores Mejorado**

### **Errores del Servidor (con respuesta)**

Cuando el servidor responde con un error:

```json
{
  "success": false,
  "data": null,
  "status": 400,
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "Las credenciales son incorrectas",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_abc123",
  "error": {
    "type": "authentication",
    "details": [
      {
        "field": "password",
        "code": "INVALID",
        "message": "La contraseña no es válida"
      }
    ]
  }
}
```

### **Errores de Red (sin respuesta)**

Cuando hay problemas de conectividad:

```json
{
  "success": false,
  "data": null,
  "status": 0,
  "code": "ERR_NETWORK",
  "message": "Error de red. Verifica tu conexión",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": {
    "type": "network",
    "details": [
      {
        "field": "network",
        "code": "ERR_NETWORK",
        "message": "Request failed"
      }
    ]
  }
}
```

## 📊 **Códigos de Error Actualizados**

### **Códigos Mantenidos (Utilizados)**

```typescript
// Autenticación y Autorización
AUTH_INVALID_CREDENTIALS;
AUTH_USER_ALREADY_EXISTS;
AUTH_USER_ALREADY_VERIFIED;
AUTH_NO_ACTIVE_SESSION;
AUTH_TOKEN_EXPIRED;
AUTH_TOKEN_INVALID;
AUTH_TOKEN_ALREADY_USED;
AUTH_TOKEN_REVOKED;
AUTH_TOKEN_MALICIOUS;
AUTH_TOKEN_OTHER_FLOW;
AUTH_FORBIDDEN;
AUTH_UPDATE_FAILED;

// Validación y Recursos
VALIDATION_FAILED;
RESOURCE_NOT_FOUND;

// Errores de Red (Axios)
ERR_NETWORK;
ERR_CANCELED;
ECONNABORTED;
ETIMEDOUT;
UNKNOWN_ERROR;

// Rate Limit y Disponibilidad
AUTH_RATE_LIMIT;
SERVICE_UNAVAILABLE;

// Usuario
AUTH_USER_NOT_FOUND;
AUTH_USER_BLOCKED;
```

### **Códigos Eliminados (No Utilizados)**

- `AUTH_LOGOUT_FAILED`
- `AUTH_LOGIN_FAILED`
- `AUTH_REGISTER_FAILED`
- `AUTH_FORGOT_PASSWORD_FAILED`
- `AUTH_RESET_PASSWORD_FAILED`
- `AUTH_FIND_ALL_FAILED`
- `AUTH_FIND_BY_ID_FAILED`
- `AUTH_SAVE_FAILED`
- `AUTH_DELETE_FAILED`
- `ERR_FR_TOO_MANY_REDIRECTS`
- `ERR_BAD_OPTION_VALUE`
- `ERR_BAD_OPTION`
- `ERR_DEPRECATED`
- `ERR_BAD_RESPONSE`
- `ERR_BAD_REQUEST`
- `ERR_NOT_SUPPORT`
- `ERR_INVALID_URL`

## 🚀 **Mejoras Implementadas**

### **1. handleApiError Mejorado**

- ✅ Manejo diferenciado entre errores de servidor y red
- ✅ Uso apropiado de códigos de Axios
- ✅ Mensajes de error amigables en español
- ✅ Tipificación automática de errores
- ✅ Información adicional para debugging

### **2. Estructura Consistente**

- ✅ Campo `message` siempre presente
- ✅ Campos opcionales para metadatos y trazabilidad
- ✅ Documentación completa de cada campo

### **3. Limpieza de Códigos**

- ✅ Eliminados códigos no utilizados (53.5% → 46.5%)
- ✅ Mantenidos solo códigos relevantes
- ✅ Códigos de Axios apropiados para errores de red

## 📝 **Ejemplos de Uso**

### **Login Exitoso**

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "user123",
    "role": "user"
  },
  "status": 200,
  "code": "SUCCESS",
  "message": "Login successful",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### **Error de Validación**

```json
{
  "success": false,
  "data": null,
  "status": 422,
  "code": "VALIDATION_FAILED",
  "message": "Los datos enviados no son válidos",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": {
    "type": "validation",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "El formato del email no es válido"
      },
      {
        "field": "password",
        "code": "TOO_SHORT",
        "message": "La contraseña debe tener al menos 8 caracteres"
      }
    ]
  }
}
```

### **Error de Red**

```json
{
  "success": false,
  "data": null,
  "status": 0,
  "code": "ETIMEDOUT",
  "message": "La solicitud ha excedido el tiempo límite",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": {
    "type": "network",
    "details": [
      {
        "field": "network",
        "code": "ETIMEDOUT",
        "message": "timeout of 10000ms exceeded"
      }
    ]
  }
}
```

## 🎉 **Beneficios**

1. **Consistencia**: Todas las respuestas siguen el mismo patrón
2. **Predictibilidad**: El frontend siempre sabe qué esperar
3. **Debugging**: Información rica para diagnosticar problemas
4. **Trazabilidad**: requestId para seguimiento de requests
5. **Localización**: Mensajes en español apropiados
6. **Tipado**: TypeScript fuerte para mejor DX
7. **Mantenibilidad**: Código más limpio y fácil de mantener

## 📋 **Recomendaciones para el Backend**

Para maximizar la consistencia, el backend debería:

1. **Siempre devolver la estructura completa**
2. **Incluir timestamp y requestId**
3. **Usar los códigos semánticos definidos**
4. **Proporcionar mensajes descriptivos en español**
5. **Incluir detalles de validación cuando sea apropiado**
6. **Mantener consistencia en el campo `data`**
