# Base de Datos MySQL para Tests de Cypress

Este documento explica cómo configurar y usar una base de datos MySQL/MariaDB específica para los tests de Cypress.

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

Crea un archivo `.env.testing` basado en `env.testing.example`:

```bash
cp env.testing.example .env.testing
```

Edita `.env.testing` con tus configuraciones:

```env
# Configuración de entorno
REACT_APP_NODE_ENV=testing
REACT_APP_API_URL=https://localhost/api
REACT_APP_CYPRESS_BASE_URL=https://localhost

# Configuración de base de datos para tests (MySQL/MariaDB)
REACT_APP_DB_HOST=localhost
REACT_APP_DB_PORT=3306
REACT_APP_DB_NAME=acamae_test
REACT_APP_DB_USER=acamae_test_user
REACT_APP_DB_PASSWORD=acamae_test_password
REACT_APP_DB_ADMIN_USER=root
REACT_APP_DB_ADMIN_PASSWORD=root
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

### Scripts Disponibles

| Script                       | Descripción                                          |
| ---------------------------- | ---------------------------------------------------- |
| `npm run test:e2e:verify`    | **Verifica que todo esté configurado correctamente** |
| `npm run test:e2e`           | Ejecuta tests con limpieza automática                |
| `npm run test:e2e:setup`     | Configura BD antes de tests                          |
| `npm run test:e2e:cleanup`   | Limpia BD después de tests                           |
| `npm run test:e2e:reset`     | Reinicia BD completamente                            |
| `npm run test:e2e:db:create` | Crea BD y usuario                                    |
| `npm run test:e2e:db:clean`  | Limpia todas las tablas                              |
| `npm run test:e2e:db:drop`   | Elimina BD y usuario                                 |

### Flujo Automático

Cuando ejecutas `npm run test:e2e`, se ejecuta automáticamente:

1. **Setup**: Crea/configura la base de datos
2. **Tests**: Ejecuta los tests de Cypress
3. **Cleanup**: Limpia las tablas

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
   - Verifica credenciales en `.env.testing`
   - Confirma que MySQL esté ejecutándose
   - Revisa permisos del usuario de pruebas

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
  REACT_APP_DB_HOST: localhost
  REACT_APP_DB_PORT: 3306
  REACT_APP_DB_NAME: acamae_test
  REACT_APP_DB_USER: acamae_test_user
  REACT_APP_DB_PASSWORD: acamae_test_password
  REACT_APP_DB_ADMIN_USER: root
  REACT_APP_DB_ADMIN_PASSWORD: root
```

## 📊 Bases de Datos Soportadas

- ✅ **MySQL/MariaDB**
- ❌ SQLite (no soportado actualmente)
- ❌ MongoDB (no soportado actualmente)

## 🚨 Consideraciones de Seguridad

1. **Nunca** uses credenciales de producción
2. Usa una base de datos **separada** para tests
3. Las credenciales de tests deben ser **diferentes** a las de desarrollo
4. Considera usar **Docker** para aislar completamente el entorno

## 📝 Notas

- La BD se limpia automáticamente antes y después de cada ejecución
- Los tests pueden usar datos reales si es necesario
- La configuración es flexible y soporta múltiples SGBD
- Los scripts manejan errores gracefully para evitar fallos en CI/CD
