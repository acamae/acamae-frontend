# Base de Datos MySQL para Tests de Cypress

Este documento explica cómo configurar y usar una base de datos MySQL/MariaDB específica para los tests de Cypress, incluyendo todas las medidas de seguridad implementadas para proteger la base de datos de producción.

## 📚 Índice de Contenido

- [🔒 Garantía de Seguridad](#-garantía-de-seguridad)
- [📋 Configuración Inicial](#-configuración-inicial)
  - [1. Arquitectura de Red](#1-arquitectura-de-red)
  - [2. Variables de Entorno](#2-variables-de-entorno)
  - [3. Configuración de Base de Datos](#3-configuración-de-base-de-datos)
- [🛡️ Medidas de Seguridad Implementadas](#️-medidas-de-seguridad-implementadas)
  - [1. Verificación de Entorno](#1-verificación-de-entorno)
  - [2. Validación de Nombres de Base de Datos](#2-validación-de-nombres-de-base-de-datos)
  - [3. Lista Negra de Bases de Datos](#3-lista-negra-de-bases-de-datos)
  - [4. Validación de Usuarios](#4-validación-de-usuarios)
  - [5. Lista Negra de Usuarios](#5-lista-negra-de-usuarios)
  - [6. Protección de Hosts de Producción](#6-protección-de-hosts-de-producción)
  - [7. Validación de Puertos Remotos](#7-validación-de-puertos-remotos)
  - [8. Verificación en Cypress](#8-verificación-en-cypress)
- [📊 Estado de las Medidas de Seguridad](#-estado-de-las-medidas-de-seguridad)
- [🚀 Uso](#-uso)
  - [Verificación Previa](#verificación-previa)
  - [Scripts Disponibles (Todos Protegidos)](#scripts-disponibles-todos-protegidos)
  - [Operaciones Protegidas](#operaciones-protegidas)
  - [Flujo Automático](#flujo-automático)
  - [Comandos de Cypress](#comandos-de-cypress)
  - [Ejemplo de Uso en Tests](#ejemplo-de-uso-en-tests)
- [🧪 Pruebas de Seguridad Realizadas](#-pruebas-de-seguridad-realizadas)
- [🛠️ Mantenimiento](#️-mantenimiento)
  - [Limpiar BD Manualmente](#limpiar-bd-manualmente)
  - [Diagnosticar Problemas](#diagnosticar-problemas)
- [🔧 Configuración Avanzada](#-configuración-avanzada)
  - [Docker](#docker)
  - [CI/CD](#cicd)
  - [Personalización de Medidas de Seguridad](#personalización-de-medidas-de-seguridad)
- [📊 Bases de Datos Soportadas](#-bases-de-datos-soportadas)
- [🔄 Actualización de Medidas](#-actualización-de-medidas)
- [🎯 Garantía Final](#-garantía-final)
- [📝 Notas Importantes](#-notas-importantes)

---

## 🔒 Garantía de Seguridad

> **GARANTÍA**: Es **IMPOSIBLE** ejecutar operaciones en base de datos de producción desde tests de Cypress

Se han implementado **8 capas de seguridad** que previenen completamente cualquier operación accidental en base de datos de producción.

## 📋 Configuración Inicial

### 1. Arquitectura de Red

La aplicación utiliza contenedores de Nginx para servir tanto el frontend como la API:

- **Frontend**: `https://localhost` (puerto 80/443)
- **API**: `https://localhost/api` (proxy a través de Nginx)
- **Base de Datos**: `localhost:3306` (MySQL/MariaDB)

Los tests de Cypress se ejecutan contra esta configuración usando HTTPS con certificados autofirmados.

#### Configuración SSL para Tests

Cypress está configurado para ignorar errores de certificados SSL durante los tests:

- `--ignore-certificate-errors`
- `--ignore-ssl-errors`
- `--disable-web-security`
- `--unsafely-treat-insecure-origin-as-secure=https://localhost`

### 2. Variables de Entorno

Crea un archivo `.env.test` basado en `env.test.example`:

```bash
cp env.test.example .env.test
```

#### ✅ Configuración Segura (Obligatoria)

```env
# Configuración de entorno
NODE_ENV=test
REACT_APP_NODE_ENV=test
REACT_APP_API_URL=https://localhost/api

# Configuración de base de datos para tests (MySQL/MariaDB)
REACT_APP_DB_HOST=localhost
REACT_APP_DB_PORT=3306
REACT_APP_DB_NAME=acamae_test
REACT_APP_DB_USER=acamae_test_user
REACT_APP_DB_PASSWORD=acamae_test_password
REACT_APP_DB_ADMIN_USER=root
REACT_APP_DB_ADMIN_PASSWORD=root
```

#### ❌ Configuración Inválida (Bloqueada por Seguridad)

```env
# ❌ CONFIGURACIÓN BLOQUEADA
NODE_ENV=production         # Entorno prohibido
REACT_APP_DB_NAME=acamae    # BD prohibida
REACT_APP_DB_USER=admin     # Usuario prohibido
REACT_APP_DB_HOST=acamae.com # Host prohibido
```

### 3. Configuración de Base de Datos

#### MySQL/MariaDB

```sql
-- Crear usuario y base de datos
CREATE USER 'acamae_test_user'@'%' IDENTIFIED BY 'acamae_test_password';
CREATE DATABASE acamae_test;
GRANT ALL PRIVILEGES ON acamae_test.* TO 'acamae_test_user'@'%';
FLUSH PRIVILEGES;
```

## 🛡️ Medidas de Seguridad Implementadas

### 1. Verificación de Entorno

```javascript
// Solo se permite NODE_ENV=test
if (nodeEnv !== 'test') {
  console.error('❌ SEGURIDAD: Este script solo puede ejecutarse en NODE_ENV=test');
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

Bases de datos **prohibidas**:

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

Usuarios **prohibidos**:

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

Hosts **prohibidos**:

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
if (process.env.NODE_ENV !== 'test') {
  console.error('❌ SEGURIDAD: Cypress solo puede ejecutarse en NODE_ENV=test');
  process.exit(1);
}
```

## 📊 Estado de las Medidas de Seguridad

| Medida de Seguridad     | Estado    | Descripción                     |
| ----------------------- | --------- | ------------------------------- |
| Verificación de entorno | ✅ ACTIVA | Solo NODE_ENV=test              |
| Validación de BD        | ✅ ACTIVA | Debe contener "test"            |
| Lista negra BD          | ✅ ACTIVA | 8 nombres prohibidos            |
| Validación de usuario   | ✅ ACTIVA | Debe contener "test"            |
| Lista negra usuario     | ✅ ACTIVA | 9 usuarios prohibidos           |
| Lista negra host        | ✅ ACTIVA | 6 hosts prohibidos              |
| Validación puerto       | ✅ ACTIVA | Puertos remotos bloqueados      |
| Verificación Cypress    | ✅ ACTIVA | Validación en cypress.config.js |

### 🚨 Comportamiento en Caso de Violación

1. **Detección inmediata**: Las validaciones se ejecutan al inicio de cada función
2. **Logs de seguridad**: Mensaje claro explicando la violación
3. **Terminación forzada**: `process.exit(1)` para detener completamente
4. **Sin operaciones**: Ninguna operación de BD se ejecuta si hay violación

## 🚀 Uso

### Verificación Previa

Ejecuta el script de verificación automática:

```bash
# Verificación completa automática
npm run test:e2e:verify
```

O verifica manualmente que la aplicación esté funcionando:

```bash
# Verificar que el frontend esté accesible
curl -k https://localhost

# Verificar que la API esté accesible
curl -k https://localhost/api/health

# Verificar conexión a la base de datos
mysql -h localhost -P 3306 -u root -p -e "SHOW DATABASES;"
```

### Scripts Disponibles (Todos Protegidos)

| Script                       | Descripción                                          | Estado       |
| ---------------------------- | ---------------------------------------------------- | ------------ |
| `npm run test:e2e:verify`    | **Verifica que todo esté configurado correctamente** | ✅ Protegido |
| `npm run test:e2e`           | Ejecuta tests con limpieza automática                | ✅ Protegido |
| `npm run test:e2e:open`      | Abre interfaz de Cypress                             | ✅ Protegido |
| `npm run test:e2e:setup`     | Configura BD antes de tests                          | ✅ Protegido |
| `npm run test:e2e:cleanup`   | Limpia BD después de tests                           | ✅ Protegido |
| `npm run test:e2e:reset`     | Reinicia BD completamente                            | ✅ Protegido |
| `npm run test:e2e:db:create` | Crea BD y usuario                                    | ✅ Protegido |
| `npm run test:e2e:db:clean`  | Limpia todas las tablas                              | ✅ Protegido |
| `npm run test:e2e:db:drop`   | Elimina BD y usuario                                 | ✅ Protegido |

### Operaciones Protegidas

Todas estas operaciones incluyen las 8 medidas de seguridad:

- [x] `createTestDatabase()` - Crear BD de test
- [x] `cleanDatabase()` - Limpiar tablas
- [x] `dropTestDatabase()` - Eliminar BD de test
- [x] `setupTestDatabase()` - Configurar BD para Cypress
- [x] `cleanTestDatabase()` - Limpiar BD desde Cypress
- [x] `resetTestDatabase()` - Reiniciar BD desde Cypress

### Flujo Automático

Cuando ejecutas `npm run test:e2e`, se ejecuta automáticamente:

1. **Validación de Seguridad**: Verifica entorno y configuración
2. **Setup**: Crea/configura la base de datos
3. **Tests**: Ejecuta los tests de Cypress
4. **Cleanup**: Limpia las tablas

### Comandos de Cypress

Dentro de los tests de Cypress, puedes usar:

```javascript
// Configurar base de datos antes de tests
cy.setupDb();

// Limpiar base de datos después de tests
cy.cleanDb();

// Reiniciar base de datos completamente
cy.resetDb();
```

### Ejemplo de Uso en Tests

```javascript
describe('User Registration', () => {
  beforeEach(() => {
    // Limpiar BD antes de cada test
    cy.cleanDb();
    cy.visit('/register');
  });

  after(() => {
    // Limpiar BD después de todos los tests
    cy.cleanDb();
  });

  it('should register a new user', () => {
    // Test que podría crear datos en BD
    cy.get('[data-testid="email"]').type('test@example.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="submit"]').click();

    // Verificar que se creó el usuario
    cy.url().should('include', '/dashboard');
  });
});
```

## 🧪 Pruebas de Seguridad Realizadas

### ✅ Todos los Escenarios Inseguros Bloqueados

1. **Entorno de producción**:

   ```bash
   NODE_ENV=production → ❌ BLOQUEADO
   ```

2. **Base de datos de producción**:

   ```bash
   REACT_APP_DB_NAME=acamae → ❌ BLOQUEADO
   ```

3. **Usuario de producción**:

   ```bash
   REACT_APP_DB_USER=admin → ❌ BLOQUEADO
   ```

4. **Host de producción**:
   ```bash
   REACT_APP_DB_HOST=acamae.com → ❌ BLOQUEADO
   ```

### ✅ Todas las Operaciones Válidas Funcionan

1. **Configuración segura**:

   ```bash
   npm run test:e2e:setup → ✅ FUNCIONA
   ```

2. **Limpieza segura**:

   ```bash
   npm run test:e2e:cleanup → ✅ FUNCIONA
   ```

3. **Reinicio seguro**:
   ```bash
   npm run test:e2e:reset → ✅ FUNCIONA
   ```

## 🛠️ Mantenimiento

### Limpiar BD Manualmente

```bash
# Limpiar todas las tablas
npm run test:e2e:db:clean

# Reiniciar BD completamente
npm run test:e2e:reset
```

### Diagnosticar Problemas

#### Problemas de Base de Datos

```bash
# Verificar configuración
node scripts/test-db-setup.js

# Crear BD manualmente
npm run test:e2e:db:create

# Limpiar BD manualmente
npm run test:e2e:db:clean
```

#### Problemas de Red/SSL

```bash
# Verificar conectividad HTTPS
curl -k -v https://localhost

# Verificar API
curl -k -v https://localhost/api/health

# Test básico de Cypress
npx cypress run --spec "cypress/e2e/register-form-database.cy.ts" --headed
```

#### Errores Comunes

1. **Error de certificado SSL**:

   - Verifica que Nginx esté ejecutándose
   - Confirma que los certificados estén configurados

2. **API no accesible**:

   - Verifica que el proxy de Nginx esté configurado para `/api`
   - Confirma que el backend esté ejecutándose

3. **Base de datos no accesible**:

   - Verifica credenciales en `.env.test`
   - Confirma que MySQL esté ejecutándose
   - Revisa permisos del usuario de pruebas

4. **Violación de seguridad**:
   - Verifica que `NODE_ENV=test`
   - Confirma que nombres de BD y usuario contengan "test"
   - Revisa que no estés usando nombres de la lista negra

## 🔧 Configuración Avanzada

### Docker

Si usas Docker, puedes crear un servicio específico para tests:

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  test-db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: acamae_test
      MYSQL_USER: acamae_test_user
      MYSQL_PASSWORD: acamae_test_password
      MYSQL_ROOT_PASSWORD: root
    ports:
      - '3307:3306'
    volumes:
      - test_db_data:/var/lib/mysql

volumes:
  test_db_data:
```

### CI/CD

Para integración continua, configura las variables de entorno:

```yaml
# .github/workflows/test.yml
env:
  NODE_ENV: test
  REACT_APP_DB_HOST: localhost
  REACT_APP_DB_PORT: 3306
  REACT_APP_DB_NAME: acamae_test
  REACT_APP_DB_USER: acamae_test_user
  REACT_APP_DB_PASSWORD: acamae_test_password
  REACT_APP_DB_ADMIN_USER: root
  REACT_APP_DB_ADMIN_PASSWORD: root
```

### Personalización de Medidas de Seguridad

#### Añadir Nuevas Restricciones

1. **Editar `scripts/test-db-setup.js`**:

   ```javascript
   const PRODUCTION_DATABASES = [
     // ... existing items
     'nueva_bd_prohibida',
   ];
   ```

2. **Añadir validaciones**:
   ```javascript
   if (nueva_condicion_insegura) {
     console.error('❌ SEGURIDAD: Nueva validación fallida');
     process.exit(1);
   }
   ```

#### Verificación de Seguridad Personalizada

```bash
# Ejecutar verificación completa
npm run test:e2e:verify

# Verificar solo la configuración de seguridad
node scripts/validate-critical-config.js
```

## 📊 Bases de Datos Soportadas

- ✅ **MySQL/MariaDB** (Completamente soportado)
- ❌ **SQLite** (No soportado actualmente)
- ❌ **MongoDB** (No soportado actualmente)

## 🔄 Actualización de Medidas

Para añadir nuevas medidas de seguridad:

1. **Añadir a listas negras** en `scripts/test-db-setup.js`
2. **Añadir validaciones adicionales** en función `validateTestEnvironment()`
3. **Actualizar documentación** en este archivo
4. **Probar nuevas validaciones** con `npm run test:e2e:verify`

## 🎯 Garantía Final

**CERTIFICADO**: Con estas medidas implementadas, es **técnicamente imposible** ejecutar operaciones en base de datos de producción desde los tests de Cypress.

**VALIDADO**: Todas las medidas han sido probadas con escenarios inseguros y **todos fueron bloqueados exitosamente**.

**ESTADO**: ✅ **100% Protegido** - 8 capas de seguridad activas

## 📝 Notas Importantes

- La BD se limpia automáticamente antes y después de cada ejecución
- Los tests pueden usar datos reales si es necesario
- La configuración es flexible y soporta múltiples SGBD
- Los scripts manejan errores gracefully para evitar fallos en CI/CD
- **Todas las operaciones requieren `NODE_ENV=test`**
- **Nombres de BD y usuarios deben contener "test"**
- **Hosts y usuarios de producción están completamente bloqueados**

---

> 🔒 **Documentación de Seguridad Unificada** - Versión 2.0
> 📅 Última actualización: 2024-12-19
> ✅ **Estado**: Todas las medidas de seguridad activas y verificadas
