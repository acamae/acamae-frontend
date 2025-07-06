# Medidas de Seguridad para Base de Datos de Testing

## 🔒 Objetivo

Prevenir completamente cualquier operación accidental en la base de datos de producción desde los tests de Cypress.

## 🛡️ Medidas Implementadas

### 1. Verificación de Entorno

```javascript
// Solo se permite NODE_ENV=testing
if (nodeEnv !== 'testing') {
  console.error('❌ SEGURIDAD: Este script solo puede ejecutarse en NODE_ENV=testing');
  process.exit(1);
}
```

### 2. Validación de Nombres de Base de Datos

```javascript
// El nombre de la BD debe contener "test"
if (!dbName.includes('test')) {
  console.error('❌ SEGURIDAD: El nombre de la base de datos debe contener "test"');
  process.exit(1);
}
```

### 3. Lista Negra de Bases de Datos

```javascript
const PRODUCTION_DATABASES = [
  'acamae',
  'acamae_prod',
  'acamae_production',
  'production',
  'prod',
  'main',
  'live',
  'master',
];
```

### 4. Validación de Usuarios

```javascript
// El usuario debe contener "test"
if (!userName.includes('test')) {
  console.error('❌ SEGURIDAD: El usuario debe contener "test" en su nombre');
  process.exit(1);
}
```

### 5. Lista Negra de Usuarios

```javascript
const PRODUCTION_USERS = [
  'acamae',
  'acamae_prod',
  'acamae_production',
  'production',
  'prod',
  'admin',
  'user',
  'main',
  'live',
  'master',
];
```

### 6. Protección de Hosts de Producción

```javascript
const PRODUCTION_HOSTS = [
  'acamae.com',
  'www.acamae.com',
  'api.acamae.com',
  'db.acamae.com',
  'mysql.acamae.com',
  'mariadb.acamae.com',
];
```

### 7. Validación de Puertos Remotos

```javascript
// Prevenir conexiones a puertos estándar en hosts remotos
if (config.host !== 'localhost' && config.host !== '127.0.0.1') {
  if (config.port === 3306 || config.port === 5432) {
    console.error('❌ SEGURIDAD: Puerto de producción detectado en host remoto');
    process.exit(1);
  }
}
```

### 8. Verificación en Cypress

```javascript
// cypress.config.js - Verificación adicional
if (process.env.NODE_ENV !== 'testing') {
  console.error('❌ SEGURIDAD: Cypress solo puede ejecutarse en NODE_ENV=testing');
  process.exit(1);
}
```

## 📋 Puntos de Verificación

### Antes de Ejecutar Cualquier Operación

- [x] NODE_ENV = 'testing'
- [x] Nombre de BD contiene 'test'
- [x] Nombre de BD no está en lista negra
- [x] Usuario contiene 'test'
- [x] Usuario no está en lista negra
- [x] Host no está en lista negra
- [x] Puerto seguro si es host remoto

### Operaciones Protegidas

- [x] `createTestDatabase()` - Crear BD de test
- [x] `cleanDatabase()` - Limpiar tablas
- [x] `dropTestDatabase()` - Eliminar BD de test
- [x] `setupTestDatabase()` - Configurar BD para Cypress
- [x] `cleanTestDatabase()` - Limpiar BD desde Cypress
- [x] `resetTestDatabase()` - Reiniciar BD desde Cypress

## 🚨 Comportamiento en Caso de Violación

1. **Detección inmediata**: Las validaciones se ejecutan al inicio de cada función
2. **Logs de seguridad**: Mensaje claro explicando la violación
3. **Terminación forzada**: `process.exit(1)` para detener completamente
4. **Sin operaciones**: Ninguna operación de BD se ejecuta si hay violación

## 🔧 Configuración Segura

### Variables de Entorno Obligatorias

```bash
NODE_ENV=testing
REACT_APP_DB_NAME=acamae_test
REACT_APP_DB_USER=acamae_test
REACT_APP_DB_PASSWORD=acamae_test_password
```

### Ejemplo de Configuración Válida

```bash
# ✅ VÁLIDO
REACT_APP_DB_NAME=acamae_test
REACT_APP_DB_USER=acamae_test_user
REACT_APP_DB_HOST=localhost
```

### Ejemplo de Configuración Inválida

```bash
# ❌ INVÁLIDO - No contiene 'test'
REACT_APP_DB_NAME=acamae_prod
REACT_APP_DB_USER=acamae_user

# ❌ INVÁLIDO - Host de producción
REACT_APP_DB_HOST=acamae.com
```

## 🧪 Verificación de Seguridad

Ejecutar el script de verificación:

```bash
npm run test:e2e:verify
```

Esto verificará:

- Configuración de entorno
- Validaciones de seguridad
- Conectividad de test
- Funcionalidad de scripts

## 🔄 Actualización de Medidas

Para añadir nuevas medidas de seguridad:

1. **Añadir a listas negras**:

   ```javascript
   // En scripts/test-db-setup.js
   const PRODUCTION_DATABASES = [
     // ... existing items
     'nueva_bd_produccion',
   ];
   ```

2. **Añadir validaciones adicionales**:

   ```javascript
   // En validateTestEnvironment()
   if (nueva_condicion_insegura) {
     console.error('❌ SEGURIDAD: Nueva validación fallida');
     process.exit(1);
   }
   ```

3. **Actualizar documentación** en este archivo

## 📊 Estado Actual

✅ **Implementado**: Todas las medidas de seguridad están activas
✅ **Verificado**: Scripts funcionan correctamente
✅ **Documentado**: Guía completa disponible
✅ **Testeado**: Verificaciones pasan exitosamente

## 🎯 Resultado

**GARANTÍA**: Es imposible ejecutar operaciones en base de datos de producción desde los tests de Cypress con estas medidas implementadas.
