import { APP_ROUTES } from '@shared/constants/appRoutes';

describe('Register Form - Database Integration', () => {
  beforeEach(() => {
    // Limpiar base de datos antes de cada test
    cy.cleanDb();

    // Visitar la página de registro
    cy.visit(APP_ROUTES.REGISTER);

    // Verificar que la página se cargó correctamente
    cy.get('[data-testid="register-page"]').should('be.visible');
    cy.get('[data-testid="register-form"]').should('be.visible');
  });

  after(() => {
    // Limpiar base de datos después de todos los tests
    cy.cleanDb();
  });

  describe('Registro exitoso con base de datos real', () => {
    it('debe registrar un usuario exitosamente en la base de datos', () => {
      // Configurar intercepción para permitir llamadas reales al API
      cy.intercept('POST', '**/api/auth/register').as('registerUser');

      // Llenar el formulario con datos válidos
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('testuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Enviar el formulario
      cy.get('[data-testid="register-form-button"]').click();

      // Esperar la llamada al API
      cy.wait('@registerUser').then(interception => {
        // Verificar que se envió la petición correcta
        expect(interception.request.body).to.deep.include({
          email: 'test@example.com',
          username: 'testuser',
        });

        // Verificar que la respuesta es exitosa
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      });

      // Verificar redirección a la página de verificación de email
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });

    it('debe mostrar error cuando el email ya existe en la base de datos', () => {
      // Primero registrar un usuario
      cy.intercept('POST', '**/api/auth/register').as('firstRegister');

      // Datos del primer usuario
      cy.get('[data-testid="register-form-email-input"]').type('existing@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('existinguser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Enviar primer registro
      cy.get('[data-testid="register-form-button"]').click();

      // Esperar el primer registro
      cy.wait('@firstRegister');

      // Volver a la página de registro
      cy.visit(APP_ROUTES.REGISTER);

      // Intentar registrar con el mismo email
      cy.intercept('POST', '**/api/auth/register').as('duplicateRegister');

      cy.get('[data-testid="register-form-email-input"]').type('existing@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('anotheruser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Enviar segundo registro
      cy.get('[data-testid="register-form-button"]').click();

      // Esperar la llamada al API
      cy.wait('@duplicateRegister').then(interception => {
        // Verificar que se recibe un error
        expect(interception.response?.statusCode).to.be.oneOf([400, 409, 422]);
      });

      // Verificar que se muestra el mensaje de error
      cy.get('[role="alert"], [aria-live="polite"], .alert, .toast')
        .should('be.visible')
        .and('contain.text', 'email');
    });
  });

  describe('Pruebas de limpieza de base de datos', () => {
    it('debe limpiar los datos entre tests', () => {
      // Configurar intercepción
      cy.intercept('POST', '**/api/auth/register').as('registerUser');

      // Registrar un usuario
      cy.get('[data-testid="register-form-email-input"]').type('cleanup@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('cleanupuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      // Esperar el registro
      cy.wait('@registerUser');

      // Limpiar explícitamente la base de datos
      cy.cleanDb();

      // Volver a registrar el mismo usuario (debe funcionar sin errores)
      cy.visit(APP_ROUTES.REGISTER);

      cy.intercept('POST', '**/api/auth/register').as('registerUserAgain');

      cy.get('[data-testid="register-form-email-input"]').type('cleanup@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('cleanupuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      // Debe funcionar sin errores
      cy.wait('@registerUserAgain').then(interception => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      });
    });
  });

  describe('Configuración de base de datos', () => {
    it('debe configurar la base de datos correctamente', () => {
      // Configurar la base de datos explícitamente
      cy.setupDb();

      // Verificar que podemos hacer una petición sin errores
      cy.intercept('POST', '**/api/auth/register').as('registerUser');

      cy.get('[data-testid="register-form-email-input"]').type('setup@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('setupuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.wait('@registerUser').then(interception => {
        // Verificar que la base de datos está funcionando
        expect(interception.response?.statusCode).to.not.equal(500);
      });
    });
  });
});
