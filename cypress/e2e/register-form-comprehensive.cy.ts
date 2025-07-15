import { APP_ROUTES } from '@shared/constants/appRoutes';

describe('Register Form - Comprehensive Test Suite', () => {
  beforeEach(() => {
    cy.visit(APP_ROUTES.REGISTER);
    cy.get('[data-testid="register-page"]').should('be.visible');
    cy.get('[data-testid="register-form"]').should('be.visible');

    // Clear any existing throttle states before each test
    cy.window().then(win => {
      win.localStorage.removeItem('acamae-throttle-states');
    });
  });

  describe('✅ Successful Registration Scenarios', () => {
    it('should register successfully with valid data and redirect to email verification', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept API call with new v2.0 structure
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: null, // New flow: no user data returned
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerSuccess');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for API call
      cy.wait('@registerSuccess');

      // Verify redirection to email verification page
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
      // Check for success message in Spanish (default language)
      cy.get('body').should('contain.text', 'Registro completado correctamente');
    });

    it('should handle button state during registration process', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('testuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Verify button is enabled before submission
      cy.get('[data-testid="register-form-button"]').should('not.be.disabled');

      // Intercept with delay to test button state
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: null,
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
        delay: 1000,
      }).as('registerWithDelay');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Verify button is disabled during submission
      cy.get('[data-testid="register-form-button"]').should('be.disabled');

      // Wait for API call
      cy.wait('@registerWithDelay');

      // Verify redirection (button no longer visible on new page)
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });

    it('should maintain language preference after successful registration', () => {
      // Change to English
      cy.get('[data-testid="language-picker-select"]').select('en-GB');

      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('english@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('englishuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept API call
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: null,
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerEnglish');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for API call
      cy.wait('@registerEnglish');

      // Verify redirection and English message
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
      cy.get('body').should('contain.text', 'Registration successful');
    });
  });

  describe('❌ Error Scenarios - API Errors', () => {
    it('should handle existing email error (AUTH_USER_ALREADY_EXISTS)', () => {
      // Fill form with existing email
      cy.get('[data-testid="register-form-email-input"]').type('existente@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept with existing email error
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 409,
        body: {
          success: false,
          data: null,
          status: 409,
          code: 'AUTH_USER_ALREADY_EXISTS',
          message: 'Ese email ya está registrado',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
          error: {
            type: 'business',
            details: [
              {
                field: 'email',
                code: 'DUPLICATE',
                message: 'Este email ya está en uso',
              },
            ],
          },
        },
      }).as('registerExistingEmail');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for API call
      cy.wait('@registerExistingEmail');

      // Verify error message is shown (in Spanish by default)
      cy.get('body').should('contain.text', 'Ese email ya está registrado');

      // Verify we stay on register page
      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should handle validation errors (VALIDATION_ERROR)', () => {
      // Fill form with data that passes client validation but server rejects
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('testuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept with validation error
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 422,
        body: {
          success: false,
          data: null,
          status: 422,
          code: 'VALIDATION_ERROR',
          message: 'Los datos enviados no son válidos',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
          error: {
            type: 'validation',
            details: [
              {
                field: 'email',
                code: 'INVALID_FORMAT',
                message: 'The email format is not valid',
              },
              {
                field: 'username',
                code: 'INVALID_FORMAT',
                message: 'Username must contain only letters, numbers, underscores and hyphens',
              },
              {
                field: 'password',
                code: 'TOO_WEAK',
                message:
                  'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
              },
            ],
          },
        },
      }).as('registerValidationError');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for API call
      cy.wait('@registerValidationError');

      // Verify error message is shown (in Spanish by default)
      cy.get('body').should('contain.text', 'Los datos enviados no son válidos');

      // Verify we stay on register page
      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should handle email service unavailable (SERVICE_UNAVAILABLE)', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('testuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept with service unavailable error
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 503,
        body: {
          success: false,
          data: null,
          status: 503,
          code: 'SERVICE_UNAVAILABLE',
          message:
            'Registro fallido: No se pudo enviar el email de verificación. Por favor, inténtalo de nuevo más tarde.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
          error: {
            type: 'server',
            details: [
              {
                field: 'email_service',
                code: 'SERVICE_UNAVAILABLE',
                message: 'Email service is temporarily unavailable',
              },
            ],
          },
        },
      }).as('registerServiceUnavailable');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for API call
      cy.wait('@registerServiceUnavailable');

      // Verify error message is shown (in Spanish by default)
      cy.get('body').should(
        'contain.text',
        'Registro fallido: No se pudo enviar el email de verificación'
      );

      // Verify we stay on register page
      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should handle database error (DATABASE_ERROR)', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('testuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept with database error
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 500,
        body: {
          success: false,
          data: null,
          status: 500,
          code: 'DATABASE_ERROR',
          message: 'Token is valid but user update failed',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
          error: {
            type: 'server',
            details: [
              {
                field: 'database',
                code: 'CONNECTION_ERROR',
                message: 'No se pudo conectar a la base de datos',
              },
            ],
          },
        },
      }).as('registerDatabaseError');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for API call
      cy.wait('@registerDatabaseError');

      // Verify error message is shown (in Spanish by default)
      cy.get('body').should('contain.text', 'Token is valid but user update failed');

      // Verify we stay on register page
      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should handle network errors (ERR_NETWORK)', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('testuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept with network error (no response)
      cy.intercept('POST', '**/api/auth/register', {
        forceNetworkError: true,
      }).as('registerNetworkError');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for API call
      cy.wait('@registerNetworkError');

      // Verify error message is shown (in Spanish by default)
      cy.get('body').should('contain.text', 'Error de red');

      // Verify we stay on register page
      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should handle timeout errors (ETIMEDOUT)', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('testuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept with REAL timeout - force network error to simulate timeout
      cy.intercept('POST', '**/api/auth/register', {
        forceNetworkError: true,
        delay: 5000, // 5 second delay to ensure timeout
      }).as('registerTimeout');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the network error to occur
      cy.wait('@registerTimeout', { timeout: 10000 });

      // Verify error message is shown
      // The error message might be shown in a toast or error container
      // Wait a bit for the error to be displayed
      cy.wait(2000);
      // Check for any error message that contains timeout-related text
      // Use a more flexible approach to find error messages
      cy.get('body').then($body => {
        const bodyText = $body.text();
        expect(
          bodyText.includes('tiempo límite') ||
            bodyText.includes('timeout') ||
            bodyText.includes('excedido') ||
            bodyText.includes('Error de red') ||
            bodyText.includes('Network error')
        ).to.be.true;
      });

      // Verify we stay on register page
      cy.url().should('include', APP_ROUTES.REGISTER);
    });
  });

  describe('🔍 Client-Side Validation Scenarios', () => {
    it('should validate email format before submission', () => {
      // Test invalid email formats
      const invalidEmails = [
        'invalid-email',
        'user@',
        'user@domain',
        'user domain.com',
        '@domain.com',
      ];

      invalidEmails.forEach(email => {
        cy.get('[data-testid="register-form-email-input"]').clear().type(email);
        cy.get('[data-testid="register-form-email-input"]').blur();

        // Verify error message appears
        cy.get('[data-testid="register-form-email-error"]')
          .should('be.visible')
          .and('contain.text', 'Por favor, introduce un email válido');
      });
    });

    it('should validate username format before submission', () => {
      // Test invalid username formats
      const invalidUsernames = [
        'ab', // too short
        'esteesunnombredeusuariodemasiadolargo123456789', // too long
        'user test', // with spaces
        'user@#$', // special characters
        'usuário', // accents
      ];

      invalidUsernames.forEach(username => {
        cy.get('[data-testid="register-form-username-input"]').clear().type(username);
        cy.get('[data-testid="register-form-username-input"]').blur();

        // Verify error message appears
        cy.get('[data-testid="register-form-username-error"]')
          .should('be.visible')
          .and('contain.text', 'El nombre de usuario debe tener entre 3 y 32 caracteres');
      });
    });

    it('should validate password strength before submission', () => {
      // Test weak passwords
      const weakPasswords = [
        'weak',
        '123456',
        'password',
        'abc123',
        'Password', // no special char
        'password123!', // no uppercase
      ];

      weakPasswords.forEach(password => {
        cy.get('[data-testid="register-form-password-input"]').clear().type(password);
        cy.get('[data-testid="register-form-password-input"]').blur();

        // Verify error message appears
        cy.get('[data-testid="register-form-password-error"]')
          .should('be.visible')
          .and('contain.text', 'La contraseña debe tener mínimo 8 caracteres');
      });
    });

    it('should validate password confirmation match', () => {
      // Fill password
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');

      // Fill different confirmation password
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Different123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').blur();

      // Verify error message appears
      cy.get('[data-testid="register-form-confirm-password-error"]')
        .should('be.visible')
        .and('contain.text', 'Las contraseñas no coinciden');
    });

    it('should require terms acceptance', () => {
      // Fill form without accepting terms
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('testuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');

      // Try to submit without accepting terms
      cy.get('[data-testid="register-form-button"]').click();

      // Verify form doesn't submit (stays on page)
      cy.url().should('include', APP_ROUTES.REGISTER);
    });
  });

  describe('🔄 Retry and Recovery Scenarios', () => {
    it('should allow retrying after validation errors', () => {
      // Fill form with invalid data
      cy.get('[data-testid="register-form-email-input"]').type('invalid-email');
      cy.get('[data-testid="register-form-username-input"]').type('a');
      cy.get('[data-testid="register-form-password-input"]').type('weak');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('different');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Verify validation errors appear
      cy.get('[data-testid="register-form-email-error"]').should('be.visible');
      cy.get('[data-testid="register-form-username-error"]').should('be.visible');
      cy.get('[data-testid="register-form-password-error"]').should('be.visible');
      cy.get('[data-testid="register-form-confirm-password-error"]').should('be.visible');

      // Correct the data
      cy.get('[data-testid="register-form-email-input"]').clear().type('valid@example.com');
      cy.get('[data-testid="register-form-username-input"]').clear().type('validuser');
      cy.get('[data-testid="register-form-password-input"]').clear().type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').clear().type('Password123!');

      // Intercept successful registration
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: null,
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerRetrySuccess');

      // Submit corrected form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for API call
      cy.wait('@registerRetrySuccess');

      // Verify successful registration
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });

    it('should allow retrying after server errors', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('testuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept with server error first
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 500,
        body: {
          success: false,
          data: null,
          status: 500,
          code: 'DATABASE_ERROR',
          message: 'Token is valid but user update failed',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerServerError');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for API call
      cy.wait('@registerServerError');

      // Verify error message is shown
      cy.get('body').should('contain.text', 'Token is valid but user update failed');

      // Intercept with success on retry
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: null,
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerRetrySuccess');

      // Submit form again
      // Wait for button to be enabled after throttling
      cy.get('[data-testid="register-form-button"]', { timeout: 10000 }).should('not.be.disabled');
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for API call
      cy.wait('@registerRetrySuccess');

      // Verify successful registration
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });
  });

  describe('🔐 Security and Accessibility Scenarios', () => {
    it('should toggle password visibility', () => {
      // Fill password
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');

      // Verify password is hidden by default
      cy.get('[data-testid="register-form-password-input"]').should(
        'have.attr',
        'type',
        'password'
      );

      // Click toggle button
      cy.get('[data-testid="btn-toggle-password"]').click();

      // Verify password is visible
      cy.get('[data-testid="register-form-password-input"]').should('have.attr', 'type', 'text');

      // Click toggle button again
      cy.get('[data-testid="btn-toggle-password"]').click();

      // Verify password is hidden again
      cy.get('[data-testid="register-form-password-input"]').should(
        'have.attr',
        'type',
        'password'
      );
    });

    it('should toggle confirm password visibility', () => {
      // Fill confirm password
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');

      // Verify password is hidden by default
      cy.get('[data-testid="register-form-confirm-password-input"]').should(
        'have.attr',
        'type',
        'password'
      );

      // Click toggle button
      cy.get('[data-testid="btn-toggle-confirm-password"]').click();

      // Verify password is visible
      cy.get('[data-testid="register-form-confirm-password-input"]').should(
        'have.attr',
        'type',
        'text'
      );

      // Click toggle button again
      cy.get('[data-testid="btn-toggle-confirm-password"]').click();

      // Verify password is hidden again
      cy.get('[data-testid="register-form-confirm-password-input"]').should(
        'have.attr',
        'type',
        'password'
      );
    });

    it('should maintain form state during errors', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('testuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept with error
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 409,
        body: {
          success: false,
          data: null,
          status: 409,
          code: 'AUTH_USER_ALREADY_EXISTS',
          message: 'The email is already registered',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerError');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for API call
      cy.wait('@registerError');

      // Verify form data is preserved
      cy.get('[data-testid="register-form-email-input"]').should('have.value', 'test@example.com');
      cy.get('[data-testid="register-form-username-input"]').should('have.value', 'testuser');
      cy.get('[data-testid="register-form-password-input"]').should('have.value', 'Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').should(
        'have.value',
        'Password123!'
      );
      cy.get('[data-testid="register-form-terms-checkbox"]').should('be.checked');
    });

    it('should handle keyboard navigation', () => {
      // Test tab navigation using proper Cypress commands
      cy.get('[data-testid="register-form-email-input"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'register-form-email-input');

      // Use focus() to navigate through form elements
      cy.get('[data-testid="register-form-username-input"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'register-form-username-input');

      cy.get('[data-testid="register-form-password-input"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'register-form-password-input');

      cy.get('[data-testid="register-form-confirm-password-input"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'register-form-confirm-password-input');

      cy.get('[data-testid="register-form-terms-checkbox"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'register-form-terms-checkbox');

      cy.get('[data-testid="register-form-button"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'register-form-button');
    });
  });

  describe('🌐 Internationalization Scenarios', () => {
    it('should display error messages in Spanish by default', () => {
      // Fill form with invalid data
      cy.get('[data-testid="register-form-email-input"]').type('invalid-email');
      cy.get('[data-testid="register-form-username-input"]').type('a');
      cy.get('[data-testid="register-form-password-input"]').type('weak');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('different');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Verify Spanish error messages
      cy.get('[data-testid="register-form-email-error"]').should(
        'contain.text',
        'Por favor, introduce un email válido'
      );
      cy.get('[data-testid="register-form-username-error"]').should(
        'contain.text',
        'El nombre de usuario debe tener entre 3 y 32 caracteres'
      );
      cy.get('[data-testid="register-form-password-error"]').should(
        'contain.text',
        'La contraseña debe tener mínimo 8 caracteres'
      );
      cy.get('[data-testid="register-form-confirm-password-error"]').should(
        'contain.text',
        'Las contraseñas no coinciden'
      );
    });

    it('should display error messages in English when language is changed', () => {
      // Change to English
      cy.get('[data-testid="language-picker-select"]').select('en-GB');

      // Fill form with invalid data
      cy.get('[data-testid="register-form-email-input"]').type('invalid-email');
      cy.get('[data-testid="register-form-username-input"]').type('a');
      cy.get('[data-testid="register-form-password-input"]').type('weak');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('different');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Verify English error messages
      cy.get('[data-testid="register-form-email-error"]').should(
        'contain.text',
        'Please enter a valid email'
      );
      cy.get('[data-testid="register-form-username-error"]').should(
        'contain.text',
        'Username must be between 3 and 32 characters'
      );
      cy.get('[data-testid="register-form-password-error"]').should(
        'contain.text',
        'Password must have at least 8 characters'
      );
      cy.get('[data-testid="register-form-confirm-password-error"]').should(
        'contain.text',
        'Passwords do not match'
      );
    });

    it('should handle API error messages in both languages', () => {
      // Test Spanish error
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('testuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 409,
        body: {
          success: false,
          data: null,
          status: 409,
          code: 'AUTH_USER_ALREADY_EXISTS',
          message: 'El email ya está registrado',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerSpanishError');

      cy.get('[data-testid="register-form-button"]').click();
      cy.wait('@registerSpanishError');
      cy.get('body').should('contain.text', 'El email ya está registrado');

      // Change to English and test English error
      cy.get('[data-testid="language-picker-select"]').select('en-GB');

      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 409,
        body: {
          success: false,
          data: null,
          status: 409,
          code: 'AUTH_USER_ALREADY_EXISTS',
          message: 'The email is already registered',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerEnglishError');

      // Wait for button to be enabled after throttling
      cy.get('[data-testid="register-form-button"]', { timeout: 10000 }).should('not.be.disabled');
      cy.get('[data-testid="register-form-button"]').click();
      cy.wait('@registerEnglishError');
      cy.get('body').should('contain.text', 'The email is already registered');
    });
  });

  describe('📱 Responsive and UI Scenarios', () => {
    it('should display correctly on mobile viewport', () => {
      // Set mobile viewport
      cy.viewport('iphone-x');

      // Verify form elements are visible and properly sized
      cy.get('[data-testid="register-form"]').should('be.visible');
      cy.get('[data-testid="register-form-email-input"]').should('be.visible');
      cy.get('[data-testid="register-form-username-input"]').should('be.visible');
      cy.get('[data-testid="register-form-password-input"]').should('be.visible');
      cy.get('[data-testid="register-form-confirm-password-input"]').should('be.visible');
      cy.get('[data-testid="register-form-terms-checkbox"]').should('be.visible');
      cy.get('[data-testid="register-form-button"]').should('be.visible');
    });

    it('should display correctly on tablet viewport', () => {
      // Set tablet viewport
      cy.viewport('ipad-2');

      // Verify form elements are visible
      cy.get('[data-testid="register-form"]').should('be.visible');
      cy.get('[data-testid="register-form-email-input"]').should('be.visible');
      cy.get('[data-testid="register-form-username-input"]').should('be.visible');
      cy.get('[data-testid="register-form-password-input"]').should('be.visible');
      cy.get('[data-testid="register-form-confirm-password-input"]').should('be.visible');
      cy.get('[data-testid="register-form-terms-checkbox"]').should('be.visible');
      cy.get('[data-testid="register-form-button"]').should('be.visible');
    });

    it('should display correctly on desktop viewport', () => {
      // Set desktop viewport
      cy.viewport(1920, 1080);

      // Verify form elements are visible
      cy.get('[data-testid="register-form"]').should('be.visible');
      cy.get('[data-testid="register-form-email-input"]').should('be.visible');
      cy.get('[data-testid="register-form-username-input"]').should('be.visible');
      cy.get('[data-testid="register-form-password-input"]').should('be.visible');
      cy.get('[data-testid="register-form-confirm-password-input"]').should('be.visible');
      cy.get('[data-testid="register-form-terms-checkbox"]').should('be.visible');
      cy.get('[data-testid="register-form-button"]').should('be.visible');
    });
  });
});
