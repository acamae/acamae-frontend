# Configuración de Tests E2E

Este documento describe la configuración centralizada para los tests end-to-end (E2E) del proyecto.

## Arquitectura de Configuración

### Fuente Única de Verdad

Todos los archivos relacionados con tests E2E utilizan el archivo `.env.test` como fuente única de verdad para la configuración. Esto elimina las discrepancias entre diferentes archivos y facilita el mantenimiento.

### Variables de Entorno Principales

```bash
# Configuración de URLs para Tests E2E
CYPRESS_BASE_URL=https://localhost
CYPRESS_API_URL=https://localhost/api
CYPRESS_SERVER_PORT=3000

# Configuración de Base de Datos para Tests
REACT_APP_DB_HOST=localhost
REACT_APP_DB_PORT=3306
REACT_APP_DB_NAME=acamae_test
REACT_APP_DB_USER=acamae_test
REACT_APP_DB_PASSWORD=acamae_test_password
REACT_APP_DB_ADMIN_USER=root
REACT_APP_DB_ADMIN_PASSWORD=rootpassword

# Configuración de API
REACT_APP_API_URL=https://localhost/api
```

## Archivos Configurados

### 1. `00-system-health-config.cy.ts`

- **Siempre se ejecuta primero** (por orden alfabético)
- Verifica que el frontend responde y la API está accesible
- Verifica que las variables de entorno de Cypress están correctamente cargadas
- Verifica la configuración de base de datos
- Si este test falla, los demás tests pueden ser poco fiables

### 2. `scripts/test-e2e-simple.js`

- **Ejecuta verificación automática** antes de los tests
- Usa `CYPRESS_BASE_URL` para la URL del servidor existente
- Verifica que el servidor esté disponible antes de ejecutar tests
- No arranca un nuevo servidor (usa el existente de Docker)
- Carga configuración desde `.env.test`
- **Falla rápido** si la configuración no es correcta

### 3. `scripts/verify-test-setup.js`

- Script unificado para validación de entorno y conectividad
- Verifica variables de entorno, frontend, API y base de datos
- Proporciona advertencias y errores claros

## Ejecución de Tests

### Orden de ejecución

Cypress ejecuta los tests en orden alfabético por nombre de archivo. Por eso, el archivo `00-system-health-config.cy.ts` siempre se ejecuta primero, asegurando que la salud del sistema y la configuración sean validadas antes de cualquier otro test.

### Ejemplo de ejecución

```bash
# Ejecutar todos los tests E2E (verificación incluida)
npm run test:e2e

# Ejecutar solo el test de health/config
npx cypress run --spec "cypress/e2e/00-system-health-config.cy.ts"
```

### Flujo automático

```bash
# 1. Verificación de configuración (00-system-health-config.cy.ts)
# 2. Setup de base de datos
# 3. Verificación de servidor
# 4. Ejecución de tests funcionales
# 5. Limpieza
```

## Troubleshooting

- Si falla `00-system-health-config.cy.ts`, revisa la configuración de entorno, el servidor y la base de datos antes de ejecutar el resto de los tests.
- Si necesitas que otro test se ejecute primero, renómbralo con un prefijo menor (no recomendado).

## Referencias

- [Documentación de Cypress - Variables de Entorno](https://docs.cypress.io/app/references/environment-variables)
- [Documentación de Cypress - Configuración](https://docs.cypress.io/app/references/configuration)
- [Documentación de Cypress - Certificados de Cliente](https://docs.cypress.io/app/references/client-certificates)
