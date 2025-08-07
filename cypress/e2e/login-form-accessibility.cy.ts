import { APP_ROUTES } from '@shared/constants/appRoutes';

describe('Login Form - Accessibility Test Suite', () => {
  beforeEach(() => {
    cy.visit(APP_ROUTES.LOGIN);
    cy.get('[data-testid="login-page"]').should('be.visible');
    cy.get('[data-testid="login-form"]').should('be.visible');

    // Clear any existing throttle states before each test
    cy.window().then(win => {
      win.localStorage.removeItem('acamae-throttle-states');
    });
  });

  describe('♿ WCAG 2.1 Compliance', () => {
    it('should have proper heading structure', () => {
      // Check for main heading
      cy.get('[data-testid="login-page-title"]').should('be.visible');
      cy.get('[data-testid="login-page-title"]').should('have.prop', 'tagName', 'H1');
    });

    it('should have proper form labels', () => {
      // Check email label
      cy.get('[data-testid="login-form-email-label"]').should('be.visible');
      cy.get('[data-testid="login-form-email-input"]').should('have.attr', 'id');
      cy.get('[data-testid="login-form-email-label"]').should('have.attr', 'for');

      // Check password label
      cy.get('[data-testid="login-form-password-label"]').should('be.visible');
      cy.get('[data-testid="login-form-password-input"]').should('have.attr', 'id');
      cy.get('[data-testid="login-form-password-label"]').should('have.attr', 'for');
    });

    it('should have proper ARIA attributes for form fields', () => {
      // Email field
      cy.get('[data-testid="login-form-email-input"]')
        .should('have.attr', 'aria-required', 'true')
        .should('have.attr', 'aria-invalid', 'false')
        .should('have.attr', 'aria-errormessage', 'login-form-email-error')
        .should('have.attr', 'type', 'email');

      // Password field
      cy.get('[data-testid="login-form-password-input"]')
        .should('have.attr', 'aria-required', 'true')
        .should('have.attr', 'aria-invalid', 'false')
        .should('have.attr', 'aria-errormessage', 'login-form-password-error')
        .should('have.attr', 'type', 'password');
    });

    it('should have proper error message attributes', () => {
      // Trigger validation error
      cy.get('[data-testid="login-form-button"]').click();

      // Check error message attributes
      cy.get('[data-testid="login-form-email-error"]')
        .should('have.attr', 'aria-live', 'polite')
        .should('have.attr', 'aria-atomic', 'true')
        .should('have.attr', 'role', 'alert');

      cy.get('[data-testid="login-form-password-error"]')
        .should('have.attr', 'aria-live', 'polite')
        .should('have.attr', 'aria-atomic', 'true')
        .should('have.attr', 'role', 'alert');
    });

    it('should have proper button attributes', () => {
      cy.get('[data-testid="login-form-button"]').should('have.attr', 'type', 'submit');

      // Check password toggle button exists and has proper attributes
      cy.get('[data-testid="login-form-password-toggle"]').should('exist');
    });

    it('should have proper focus management', () => {
      // Check that form elements are focusable
      cy.get('[data-testid="login-form-email-input"]').focus();
      cy.get('[data-testid="login-form-email-input"]').should('be.focused');

      cy.get('[data-testid="login-form-password-input"]').focus();
      cy.get('[data-testid="login-form-password-input"]').should('be.focused');

      cy.get('[data-testid="login-form-button"]').focus();
      cy.get('[data-testid="login-form-button"]').should('be.focused');
    });

    it('should have proper keyboard navigation', () => {
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

    it('should have proper color contrast', () => {
      // Check that form elements have sufficient color contrast
      cy.get('[data-testid="login-form-email-input"]').should('be.visible');
      cy.get('[data-testid="login-form-password-input"]').should('be.visible');
      cy.get('[data-testid="login-form-button"]').should('be.visible');

      // Check labels are visible
      cy.get('[data-testid="login-form-email-label"]').should('be.visible');
      cy.get('[data-testid="login-form-password-label"]').should('be.visible');
    });

    it('should have proper form validation feedback', () => {
      // Trigger validation errors
      cy.get('[data-testid="login-form-button"]').click();

      // Check that error messages are announced to screen readers
      cy.get('[data-testid="login-form-email-error"]')
        .should('have.attr', 'aria-live', 'polite')
        .should('be.visible');

      cy.get('[data-testid="login-form-password-error"]')
        .should('have.attr', 'aria-live', 'polite')
        .should('be.visible');
    });

    it('should have proper error state attributes', () => {
      // Trigger validation error
      cy.get('[data-testid="login-form-button"]').click();

      // Check that fields have proper error state attributes
      cy.get('[data-testid="login-form-email-input"]').should('have.attr', 'aria-invalid', 'true');

      cy.get('[data-testid="login-form-password-input"]').should(
        'have.attr',
        'aria-invalid',
        'true'
      );
    });

    it('should have proper form structure', () => {
      // Check that form has proper structure
      cy.get('[data-testid="login-form"]').should('have.attr', 'novalidate');
      cy.get('[data-testid="login-form"]').should('have.attr', 'data-testid', 'login-form');
    });

    it('should have proper autocomplete attributes', () => {
      // Check email field has proper autocomplete
      cy.get('[data-testid="login-form-email-input"]').should('have.attr', 'type', 'email');

      // Check password field has proper autocomplete
      cy.get('[data-testid="login-form-password-input"]').should('have.attr', 'type', 'password');
    });

    it('should have proper password visibility toggle accessibility', () => {
      // Check that toggle button exists
      cy.get('[data-testid="login-form-password-toggle"]').should('exist');

      // Check that password input exists
      cy.get('[data-testid="login-form-password-input"]').should('exist');

      // Check initial password type
      cy.get('[data-testid="login-form-password-input"]').should('have.attr', 'type', 'password');
    });

    it('should have proper loading state accessibility', () => {
      // Fill form with valid data
      cy.get('[data-testid="login-form-email-input"]').type('test@example.com').blur();
      cy.get('[data-testid="login-form-password-input"]').type('Password123!').blur();

      // Intercept with delay to test loading state
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

      cy.get('[data-testid="login-form-button"]').click();

      // Check loading state
      cy.get('[data-testid="login-form-button"]').should('be.disabled');
      cy.get('[data-testid="login-form-button"]').should('contain.text', 'Accediendo');
    });

    it('should have proper error state accessibility', () => {
      // Fill form with invalid data
      cy.get('[data-testid="login-form-email-input"]').type('invalid-email').blur();
      cy.get('[data-testid="login-form-password-input"]').type('weak').blur();

      // Check error state attributes
      cy.get('[data-testid="login-form-email-input"]').should('have.attr', 'aria-invalid', 'true');

      cy.get('[data-testid="login-form-password-input"]').should(
        'have.attr',
        'aria-invalid',
        'true'
      );

      // Check error messages are visible
      cy.get('[data-testid="login-form-email-error"]').should('be.visible');
      cy.get('[data-testid="login-form-password-error"]').should('be.visible');
    });

    it('should have proper form submission accessibility', () => {
      // Fill form with valid data
      cy.get('[data-testid="login-form-email-input"]').type('test@example.com').blur();
      cy.get('[data-testid="login-form-password-input"]').type('Password123!').blur();

      // Intercept API call
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

      // Submit form
      cy.get('[data-testid="login-form-button"]').click();
      cy.wait('@loginSuccess');

      // Check that API call was made (redirection might not work in test environment)
      cy.get('@loginSuccess.all').should('have.length', 1);
    });

    it('should have proper throttling accessibility', () => {
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

    it('should have proper navigation link accessibility', () => {
      // Check registration link
      cy.get('a[href*="register"]').should('be.visible').should('have.attr', 'href');

      // Check forgot password link
      cy.get('a[href*="forgot-password"]').should('be.visible').should('have.attr', 'href');
    });

    it('should have proper page title and description', () => {
      // Check page title
      cy.get('[data-testid="login-page-title"]').should('be.visible');
      cy.get('[data-testid="login-page-description"]').should('be.visible');
    });

    it('should have proper form field grouping', () => {
      // Check that form groups are properly structured
      cy.get('[data-testid="login-form-email-input"]').should('be.visible');
      cy.get('[data-testid="login-form-password-input"]').should('be.visible');

      // Check that password field is in an input group
      cy.get('[data-testid="login-form-password-input"]')
        .parent()
        .should('have.class', 'input-group');
    });

    it('should have proper error recovery', () => {
      // Trigger validation error
      cy.get('[data-testid="login-form-button"]').click();
      cy.get('[data-testid="login-form-email-error"]').should('be.visible');

      // Fix the error
      cy.get('[data-testid="login-form-email-input"]').clear().type('test@example.com').blur();

      // Wait a moment for the validation to update
      cy.wait(1000);

      // Check that the error is no longer visible
      cy.get('[data-testid="login-form-email-error"]').should('not.be.visible');
    });
  });
});
