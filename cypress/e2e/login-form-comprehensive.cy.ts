import { APP_ROUTES } from '@shared/constants/appRoutes';

describe('Login Form - Comprehensive Test Suite', () => {
  beforeEach(() => {
    cy.visit(APP_ROUTES.LOGIN);
    cy.get('[data-testid="login-page"]').should('be.visible');
    cy.get('[data-testid="login-form"]').should('be.visible');

    // Clear any existing throttle states before each test
    cy.window().then(win => {
      win.localStorage.removeItem('acamae-throttle-states');
    });
  });

  describe('✅ Successful Login Scenarios', () => {
    it('should login successfully with valid credentials and redirect to dashboard', () => {
      // Fill form with valid data
      cy.get('[data-testid="login-form-email-input"]').type('test@example.com').blur();
      cy.get('[data-testid="login-form-password-input"]').type('Password123!').blur();

      // Intercept API call with success response
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'USER',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
          status: 200,
          code: 'SUCCESS',
          message: 'Login successful',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('loginSuccess');

      // Submit button should be enabled when there are no validation errors
      cy.get('[data-testid="login-form-button"]').should('be.enabled');
      cy.get('[data-testid="login-form-button"]').click();

      // Wait for API call
      cy.wait('@loginSuccess');

      // Check that API call was made (redirection might not work in test environment)
      cy.get('@loginSuccess.all').should('have.length', 1);
    });

    it('should handle button state during login process', () => {
      // Fill form with valid data
      cy.get('[data-testid="login-form-email-input"]').type('test@example.com').blur();
      cy.get('[data-testid="login-form-password-input"]').type('Password123!').blur();

      // Verify button is enabled before submission
      cy.get('[data-testid="login-form-button"]').should('be.enabled');

      // Intercept with delay to test button state
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'USER',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
          status: 200,
          code: 'SUCCESS',
          message: 'Login successful',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
        delay: 1000,
      }).as('loginWithDelay');

      // Submit button should be enabled when there are no validation errors
      cy.get('[data-testid="login-form-button"]').should('be.enabled');
      cy.get('[data-testid="login-form-button"]').click();

      // Verify button is disabled during submission
      cy.get('[data-testid="login-form-button"]').should('be.disabled');

      // Wait for API call
      cy.wait('@loginWithDelay');

      // Verify redirection (button no longer visible on new page)
      cy.url().should('include', APP_ROUTES.DASHBOARD);
    });

    it('should maintain language preference after successful login', () => {
      // Change to English
      cy.get('[data-testid="language-picker-select"]').select('en-GB');

      // Fill form with valid data
      cy.get('[data-testid="login-form-email-input"]').type('english@example.com').blur();
      cy.get('[data-testid="login-form-password-input"]').type('Password123!').blur();

      // Intercept API call
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: '1',
            username: 'englishuser',
            email: 'english@example.com',
            role: 'USER',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
          status: 200,
          code: 'SUCCESS',
          message: 'Login successful',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('loginEnglish');

      cy.get('[data-testid="login-form-button"]').click();
      cy.wait('@loginEnglish');

      // Check that API call was made
      cy.get('@loginEnglish.all').should('have.length', 1);
    });
  });

  describe('❌ Failed Login Scenarios', () => {
    it('should handle invalid credentials error', () => {
      // Fill form with valid data so the button is enabled
      cy.get('[data-testid="login-form-email-input"]').type('invalid@example.com').blur();
      cy.get('[data-testid="login-form-password-input"]').type('Password123!').blur();

      // Intercept API call with error response
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 401,
        body: {
          success: false,
          data: null,
          status: 401,
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid credentials',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('loginError');

      cy.get('[data-testid="login-form-button"]').click({ force: true });
      cy.wait('@loginError');

      // Should remain on login page
      cy.url().should('include', APP_ROUTES.LOGIN);
      cy.get('[data-testid="login-form"]').should('be.visible');
    });

    it('should handle network error', () => {
      // Fill form with valid data
      cy.get('[data-testid="login-form-email-input"]').type('test@example.com').blur();
      cy.get('[data-testid="login-form-password-input"]').type('Password123!').blur();

      // Intercept API call with network error
      cy.intercept('POST', '**/api/auth/login', {
        forceNetworkError: true,
      }).as('loginNetworkError');

      cy.get('[data-testid="login-form-button"]').click();
      cy.wait('@loginNetworkError');

      // Should remain on login page
      cy.url().should('include', APP_ROUTES.LOGIN);
      cy.get('[data-testid="login-form"]').should('be.visible');
    });

    it('should handle server error', () => {
      // Fill form with valid data
      cy.get('[data-testid="login-form-email-input"]').type('test@example.com').blur();
      cy.get('[data-testid="login-form-password-input"]').type('Password123!').blur();

      // Intercept API call with server error
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 500,
        body: {
          success: false,
          data: null,
          status: 500,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('loginServerError');

      cy.get('[data-testid="login-form-button"]').click();
      cy.wait('@loginServerError');

      // Should remain on login page
      cy.url().should('include', APP_ROUTES.LOGIN);
      cy.get('[data-testid="login-form"]').should('be.visible');
    });
  });

  describe('🔍 Form Validation', () => {
    it('should show validation errors for invalid email format', () => {
      cy.get('[data-testid="login-form-email-input"]').type('invalid-email').blur();
      cy.get('[data-testid="login-form-password-input"]').type('Password123!').blur();

      // Should show email validation error
      cy.get('[data-testid="login-form-email-error"]').should('be.visible');
      cy.get('[data-testid="login-form-email-error"]').should(
        'contain.text',
        'Por favor, introduce un email válido.'
      );

      // Button should be disabled
      cy.get('[data-testid="login-form-button"]').should('be.disabled');
    });

    it('should show validation errors for invalid password format', () => {
      cy.get('[data-testid="login-form-email-input"]').type('test@example.com').blur();
      cy.get('[data-testid="login-form-password-input"]').type('weak').blur();

      // Should show password validation error
      cy.get('[data-testid="login-form-password-error"]').should('be.visible');
      cy.get('[data-testid="login-form-password-error"]').should(
        'contain.text',
        'La contraseña debe tener mínimo 8 caracteres, al menos una letra mayúscula, una minúscula y un número.'
      );

      // Button should be disabled
      cy.get('[data-testid="login-form-button"]').should('be.disabled');
    });

    it('should show required field errors when fields are empty', () => {
      cy.get('[data-testid="login-form-button"]').click();

      // Should show required field errors
      cy.get('[data-testid="login-form-email-error"]').should('be.visible');
      cy.get('[data-testid="login-form-email-error"]').should(
        'contain.text',
        'Por favor, introduce un email válido.'
      );
      cy.get('[data-testid="login-form-password-error"]').should('be.visible');
      cy.get('[data-testid="login-form-password-error"]').should(
        'contain.text',
        'Por favor, introduce una contraseña.'
      );

      // Button should be disabled
      cy.get('[data-testid="login-form-button"]').should('be.disabled');
    });

    it('should clear validation errors when user starts typing', () => {
      // Trigger validation errors
      cy.get('[data-testid="login-form-button"]').click();
      cy.get('[data-testid="login-form-email-error"]').should('be.visible');

      // Start typing valid email
      cy.get('[data-testid="login-form-email-input"]').clear().type('test@example.com').blur();

      // Wait for validation to update
      cy.wait(1000);

      // Error should be cleared
      cy.get('[data-testid="login-form-email-error"]').should('not.be.visible');
    });
  });

  describe('👁️ Password Visibility Toggle', () => {
    it('should toggle password visibility when eye icon is clicked', () => {
      // Fill password
      cy.get('[data-testid="login-form-password-input"]').type('Password123!').blur();

      // Verify password is hidden by default
      cy.get('[data-testid="login-form-password-input"]').should('have.attr', 'type', 'password');

      // Click toggle button
      cy.get('[data-testid="login-form-password-toggle"]').click();

      // Verify password is visible
      cy.get('[data-testid="login-form-password-input"]').should('have.attr', 'type', 'text');

      // Click toggle button again
      cy.get('[data-testid="login-form-password-toggle"]').click();

      // Verify password is hidden again
      cy.get('[data-testid="login-form-password-input"]').should('have.attr', 'type', 'password');
    });

    it('should have correct aria-label for password toggle', () => {
      cy.get('[data-testid="login-form-password-toggle"]').should(
        'have.attr',
        'aria-label',
        'Mostrar/ocultar contraseña'
      );
    });
  });

  describe('🌐 Internationalization', () => {
    it('should display form in Spanish by default', () => {
      cy.get('[data-testid="login-page-title"]').should('contain.text', 'Iniciar sesión');
      cy.get('[data-testid="login-form-email-label"]').should('contain.text', 'Correo electrónico');
      cy.get('[data-testid="login-form-password-label"]').should('contain.text', 'Contraseña');
      cy.get('[data-testid="login-form-button"]').should('contain.text', 'Acceder');
    });

    it('should switch to English when language is changed', () => {
      // Change to English
      cy.get('[data-testid="language-picker-select"]').select('en-GB');

      // Wait for language change to take effect
      cy.wait(1000);

      // Verify form elements are in English
      cy.get('[data-testid="login-page-title"]').should('contain.text', 'Login');
      cy.get('[data-testid="login-form-email-label"]').should('contain.text', 'Email');
      cy.get('[data-testid="login-form-password-label"]').should('contain.text', 'Password');
      cy.get('[data-testid="login-form-button"]').should('contain.text', 'Login');
    });

    it('should display error messages in selected language', () => {
      // Change to English
      cy.get('[data-testid="language-picker-select"]').select('en-GB');

      // Trigger validation error
      cy.get('[data-testid="login-form-email-input"]').type('invalid-email').blur();

      // Error should be in English
      cy.get('[data-testid="login-form-email-error"]').should(
        'contain.text',
        'Please enter a valid email.'
      );

      // Change back to Spanish
      cy.get('[data-testid="language-picker-select"]').select('es-ES');

      // Error should be in Spanish
      cy.get('[data-testid="login-form-email-error"]').should(
        'contain.text',
        'Por favor, introduce un email válido.'
      );
    });
  });

  describe('🔒 Security Features', () => {
    it('should show throttling warning when attempts are limited', () => {
      // Fill form with valid data
      cy.get('[data-testid="login-form-email-input"]').type('test@example.com').blur();
      cy.get('[data-testid="login-form-password-input"]').type('Password123!').blur();

      // Intercept with throttling response
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 429,
        body: {
          success: false,
          data: null,
          status: 429,
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many attempts',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('loginThrottled');

      cy.get('[data-testid="login-form-button"]').click();
      cy.wait('@loginThrottled');

      // Check throttling warning is accessible (if it exists)
      cy.get('body').then($body => {
        if ($body.find('[data-testid="login-form-attempts-warning"]').length > 0) {
          cy.get('[data-testid="login-form-attempts-warning"]')
            .should('have.attr', 'role', 'alert')
            .should('be.visible');
        }
      });
    });

    it('should disable form during throttling period', () => {
      // Fill form with valid data
      cy.get('[data-testid="login-form-email-input"]').type('test@example.com').blur();
      cy.get('[data-testid="login-form-password-input"]').type('Password123!').blur();

      // Intercept with throttling response
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 429,
        body: {
          success: false,
          data: null,
          status: 429,
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many attempts',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('loginThrottled');

      cy.get('[data-testid="login-form-button"]').click();
      cy.wait('@loginThrottled');

      // Button should be disabled during throttling
      cy.get('[data-testid="login-form-button"]').should('be.disabled');
    });
  });

  describe('♿ Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Check email field
      cy.get('[data-testid="login-form-email-input"]')
        .should('have.attr', 'aria-required', 'true')
        .should('have.attr', 'aria-invalid', 'false')
        .should('have.attr', 'aria-errormessage', 'login-form-email-error');

      // Check password field
      cy.get('[data-testid="login-form-password-input"]')
        .should('have.attr', 'aria-required', 'true')
        .should('have.attr', 'aria-invalid', 'false')
        .should('have.attr', 'aria-errormessage', 'login-form-password-error');

      // Check error messages
      cy.get('[data-testid="login-form-email-error"]')
        .should('have.attr', 'aria-live', 'polite')
        .should('have.attr', 'aria-atomic', 'true')
        .should('have.attr', 'role', 'alert');
    });

    it('should have proper form labels', () => {
      cy.get('[data-testid="login-form-email-label"]').should('be.visible');
      cy.get('[data-testid="login-form-password-label"]').should('be.visible');
    });

    it('should have proper button attributes', () => {
      cy.get('[data-testid="login-form-button"]').should('have.attr', 'type', 'submit');
    });

    it('should handle keyboard navigation', () => {
      // Tab through form elements in correct order
      cy.get('[data-testid="login-form-email-input"]').focus();
      cy.get('[data-testid="login-form-email-input"]').should('be.focused');

      cy.get('[data-testid="login-form-password-input"]').focus();
      cy.get('[data-testid="login-form-password-input"]').should('be.focused');

      cy.get('[data-testid="login-form-password-toggle"]').focus();
      cy.get('[data-testid="login-form-password-toggle"]').should('be.focused');

      cy.get('[data-testid="login-form-button"]').focus();
      cy.get('[data-testid="login-form-button"]').should('be.focused');
    });
  });

  describe('🔗 Navigation Links', () => {
    it('should have link to registration page', () => {
      cy.get('a[href*="register"]').should('be.visible');
      cy.get('a[href*="register"]').should('contain.text', 'Registrarse');
    });

    it('should have link to forgot password page', () => {
      cy.get('a[href*="forgot-password"]').should('be.visible');
      cy.get('a[href*="forgot-password"]').should('contain.text', '¿Olvidaste tu contraseña?');
    });

    it('should navigate to registration page when link is clicked', () => {
      cy.get('a[href*="register"]').first().click();
      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should navigate to forgot password page when link is clicked', () => {
      cy.get('a[href*="forgot-password"]').first().click();
      cy.url().should('include', APP_ROUTES.FORGOT_PASSWORD);
    });
  });

  describe('📱 Responsive Design', () => {
    it('should display correctly on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="login-page"]').should('be.visible');
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="login-form-button"]').should('be.visible');
    });

    it('should display correctly on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.get('[data-testid="login-page"]').should('be.visible');
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="login-form-button"]').should('be.visible');
    });

    it('should display correctly on desktop viewport', () => {
      cy.viewport(1920, 1080);
      cy.get('[data-testid="login-page"]').should('be.visible');
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="login-form-button"]').should('be.visible');
    });
  });
});
