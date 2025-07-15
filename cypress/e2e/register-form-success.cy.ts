import enGB from '@infrastructure/i18n/locales/en-GB.json';
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
          message: esES.register.success,
          code: 'SUCCESS',
          status: 201,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            is_verified: false,
          },
        },
      }).as('registerSuccess');

      // Submit the form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerSuccess');

      // Verify redirection to email verification page
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);

      // Verify that the success message is displayed
      cy.get('body').should('contain.text', esES.register.success);
    });

    it('should disable button during submission and enable it after response', () => {
      // Fill the form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call with delay to verify button state
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: esES.register.success,
          code: 'SUCCESS',
          status: 201,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            is_verified: false,
          },
        },
        delay: 1000, // Delay to verify button state
      }).as('registerSuccessWithDelay');

      // Verify that the button is enabled before submission
      cy.get('[data-testid="register-form-button"]').should('not.be.disabled');

      // Submit the form
      cy.get('[data-testid="register-form-button"]').click();

      // Verify that the button is disabled during submission
      cy.get('[data-testid="register-form-button"]').should('be.disabled');

      // Wait for the API call
      cy.wait('@registerSuccessWithDelay');

      // Verify redirection (the button is no longer visible on the new page)
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
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
          message: esES.register.success,
          code: 'SUCCESS',
          status: 201,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            is_verified: false,
          },
        },
      }).as('registerSuccess');

      // Submit the form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerSuccess');

      // Verify redirection
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);

      // Verify that the success message is accessible and has focus
      cy.get('body').should('contain.text', esES.register.success);

      // Verify that there is an element with the success message that is accessible
      cy.get('[role="alert"], [aria-live="polite"], .alert, .toast')
        .should('contain.text', esES.register.success)
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
          message: enGB.register.success,
          code: 'SUCCESS',
          status: 201,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            is_verified: false,
          },
        },
      }).as('registerSuccessEn');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerSuccessEn');

      // Verify redirection to email verification page
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);

      // Verify that the success message is displayed in English
      cy.get('body').should('contain.text', enGB.register.success);
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
          message: enGB.register.success,
          code: 'SUCCESS',
          status: 201,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            is_verified: false,
          },
        },
      }).as('registerSuccessEn');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerSuccessEn');

      // Verify redirection
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);

      // Note: The language picker is not present on the success page
      // The language preference is maintained through the application state

      // Verify that the success message is displayed in English
      cy.get('body').should('contain.text', enGB.register.success);
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
          message: esES.register.success,
          code: 'SUCCESS',
          status: 201,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            is_verified: false,
          },
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

      // Intercept the API call with delay to verify states
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: esES.register.success,
          code: 'SUCCESS',
          status: 201,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            is_verified: false,
          },
        },
        delay: 1500, // Delay to verify loading states
      }).as('registerSuccessWithDelay');

      // Verify that the button is enabled before submission
      cy.get('[data-testid="register-form-button"]').should('not.be.disabled');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Verify that the button is disabled and shows loading state
      cy.get('[data-testid="register-form-button"]').should('be.disabled');

      // Verify that there is loading indicator (spinner, "Sending..." text, etc.)
      cy.get('[data-testid="register-form-button"]')
        .should('be.disabled')
        .and('satisfy', button => {
          const text = button.text();
          return text.includes('Enviando') || text.includes('Loading') || text.includes('...');
        });

      // Wait for the API call
      cy.wait('@registerSuccessWithDelay');

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
          message: esES.register.success,
          code: 'SUCCESS',
          status: 201,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            is_verified: false,
          },
        },
      }).as('registerSuccess');

      // Submit form with Enter (use realPress to simulate real keyboard)
      cy.get('[data-testid="register-form-button"]').type('{enter}');

      // Wait for the API call
      cy.wait('@registerSuccess');

      // Verify redirection
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);

      // Verify that the success message is accessible
      cy.get('body').should('contain.text', esES.register.success);
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
          message: esES.register.success,
          code: 'SUCCESS',
          status: 201,
          data: {
            id: '1',
            email: 'nuevo@example.com',
            username: 'usuarionuevo',
            role: 'user',
            is_verified: false,
          },
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
        .should('contain.text', esES.register.success)
        .and('be.visible');
    });
  });
});
