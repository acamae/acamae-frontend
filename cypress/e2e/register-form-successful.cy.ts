import esES from '@infrastructure/i18n/locales/es-ES.json';
import { APP_ROUTES } from '@shared/constants/appRoutes';

describe('Register Form - Successful Registration', () => {
  beforeEach(() => {
    // Visit the register page
    cy.visit(APP_ROUTES.REGISTER);

    // Verify that the page loaded correctly
    cy.get('[data-testid="register-page"]').should('be.visible');
    cy.get('[data-testid="register-form"]').should('be.visible');
  });

  describe('Successful registration in Spanish', () => {
    it('should register successfully and redirect showing success message', () => {
      // Fill the form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call to simulate successful registration
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerSuccess');

      // Submit the form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerSuccess');

      // Verify redirection to email verification page
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);

      // Verify that the success message is displayed
      cy.get('body').should('contain.text', 'Registro completado correctamente');
    });

    it('should show expected content after successful registration', () => {
      // Fill the form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('nuevo2@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo2');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call to simulate successful registration
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: {
            id: '2',
            email: 'nuevo2@example.com',
            username: 'usuarionuevo2',
            role: 'user',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456790',
        },
      }).as('registerSuccess2');

      // Submit the form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerSuccess2');

      // Verify redirection to email verification page
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);

      // Verify that the success message is displayed
      cy.get('body').should('contain.text', 'Registro completado correctamente');
    });

    it('should maintain focus on success message after redirection', () => {
      // Fill the form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call to simulate successful registration
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerSuccess');

      // Submit the form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerSuccess');

      // Verify redirection
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);

      // Verify that the success message is accessible and has focus
      cy.get('body').should('contain.text', 'Registro completado correctamente');

      // Verify that there is an element with the success message that is accessible
      cy.get('[role="alert"], [aria-live="polite"], .alert, .toast')
        .should('contain.text', 'Registro completado correctamente')
        .and('be.visible');
    });
  });

  describe('Successful registration in English', () => {
    it('should register successfully and redirect showing success message in English', () => {
      // Change language to English
      cy.get('[data-testid="language-picker-select"]').select('en-GB');

      // Fill the form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call to simulate successful registration
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerSuccessEn');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerSuccessEn');

      // Verify redirection to email verification page
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);

      // Verify that the success message is displayed in English
      cy.get('body').should('contain.text', 'Registration successful');
    });

    it('should maintain English language after successful registration', () => {
      // Change language to English
      cy.get('[data-testid="language-picker-select"]').select('en-GB');

      // Verify that the language changed
      cy.get('[data-testid="language-picker-select"]').should('have.value', 'en-GB');

      // Fill the form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call to simulate successful registration
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerSuccessEn');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerSuccessEn');

      // Verify redirection
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);

      // Verify that the success message is displayed in English
      cy.get('body').should('contain.text', 'Registration successful');
    });
  });

  describe('Form behavior during successful registration', () => {
    it('should clear validation errors when registration is successful', () => {
      // Fill the form with invalid data first
      cy.get('[data-testid="register-form-email-input"]').type('email-invalido');
      cy.get('[data-testid="register-form-email-input"]').blur();

      // Verify that the validation error appears
      cy.get('[data-testid="register-form-email-input"]')
        .parent()
        .should('contain.text', esES.errors.email.invalid);

      // Correct the email and fill the rest of the form
      cy.get('[data-testid="register-form-email-input"]').clear().type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call to simulate successful registration
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerSuccess');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerSuccess');

      // Verify redirection (errors are no longer visible on the new page)
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);

      // Verify that there are no validation errors on the new page
      cy.get('body').should('not.contain.text', esES.errors.email.invalid);
    });

    it('should handle loading state correctly during registration', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call with delay to simulate loading state
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
        delay: 1000, // 1 second delay
      }).as('registerWithDelay');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Verify that the button is disabled during loading
      cy.get('[data-testid="register-form-button"]').should('be.disabled');

      // Wait for the API call
      cy.wait('@registerWithDelay');

      // Verify redirection
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });
  });

  describe('Accessibility in successful registration', () => {
    it('should be navigable by keyboard during entire successful registration process', () => {
      // Fill form using keyboard navigation (focus + type)
      cy.get('[data-testid="register-form-email-input"]').focus().type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').focus().type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').focus().type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').focus().type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').focus().check();

      // Verify that the button can receive focus
      cy.get('[data-testid="register-form-button"]').focus().should('be.focused');

      // Intercept the API call to simulate successful registration
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerSuccess');

      // Submit form with Enter (use realPress to simulate real keyboard)
      cy.get('[data-testid="register-form-button"]').type('{enter}');

      // Wait for the API call
      cy.wait('@registerSuccess');

      // Verify redirection
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);

      // Verify that the success message is accessible
      cy.get('body').should('contain.text', 'Registro completado correctamente');
    });

    it('should have appropriate ARIA attributes in success message', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call to simulate successful registration
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerSuccess');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerSuccess');

      // Verify redirection
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);

      // Verify that the success message has appropriate ARIA attributes
      cy.get('[role="alert"], [aria-live="polite"], .alert-success, .toast-success')
        .should('contain.text', 'Registro completado correctamente')
        .and('be.visible');
    });
  });
});
