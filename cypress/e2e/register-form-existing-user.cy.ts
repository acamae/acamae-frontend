import enGB from '@infrastructure/i18n/locales/en-GB.json';
import esES from '@infrastructure/i18n/locales/es-ES.json';
import { APP_ROUTES } from '@shared/constants/appRoutes';

describe('Register Form - Existing User/Email Cases', () => {
  beforeEach(() => {
    // Visit the register page
    cy.visit(APP_ROUTES.REGISTER);

    // Verify that the page loaded correctly
    cy.get('[data-testid="register-page"]').should('be.visible');
    cy.get('[data-testid="register-form"]').should('be.visible');
  });

  describe('Existing user', () => {
    it('should show error toast when username already exists', () => {
      // Fill form with valid data but existing username
      cy.get('[data-testid="register-form-email-input"]').type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarioexistente');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call to simulate existing user
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 409,
        body: {
          success: false,
          message: esES.errors.username.taken,
          code: 409,
          status: 409,
          data: null,
        },
      }).as('registerWithExistingUsername');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerWithExistingUsername');

      // Verify that an error message is shown (toast or global message)
      // This can appear as toast, alert or message in page body
      cy.get('body').should('contain.text', esES.errors.username.taken);

      // Verify that it stays on the register page
      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should show error toast when username already exists (in English)', () => {
      // Change language to English
      cy.get('[data-testid="language-picker-select"]').select('en-GB');

      // Fill form with valid data but existing username
      cy.get('[data-testid="register-form-email-input"]').type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarioexistente');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call to simulate existing user
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 409,
        body: {
          success: false,
          message: enGB.errors.username.taken,
          code: 409,
          status: 409,
          data: null,
        },
      }).as('registerWithExistingUsernameEn');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerWithExistingUsernameEn');

      // Verify that an error message is shown in English
      cy.get('body').should('contain.text', enGB.errors.username.taken);

      // Verify that it stays on the register page
      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should allow retrying registration after an error', () => {
      // Fill form with existing username
      cy.get('[data-testid="register-form-email-input"]').type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarioexistente');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept first call - existing user
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 409,
        body: {
          success: false,
          message: esES.errors.username.taken,
          code: 409,
          status: 409,
          data: null,
        },
      }).as('registerWithExistingUsername');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();
      cy.wait('@registerWithExistingUsername');

      // Verify error
      cy.get('body').should('contain.text', esES.errors.username.taken);

      // Correct the username
      cy.get('[data-testid="register-form-username-input"]').clear().type('usuarionuevo');

      // Intercept second call - successful registration
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: esES.register.success,
          code: 201,
          status: 201,
          data: {
            user: {
              id: 1,
              email: 'nuevo@example.com',
              username: 'usuarionuevo',
            },
          },
        },
      }).as('registerSuccess');

      // Submit corrected form
      cy.get('[data-testid="register-form-button"]').click();
      cy.wait('@registerSuccess');

      // Verify redirection to email verification page
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });
  });

  describe('Existing email', () => {
    it('should show error toast when email already exists', () => {
      // Fill form with valid data but existing email
      cy.get('[data-testid="register-form-email-input"]').type('existente@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call to simulate existing email
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 409,
        body: {
          success: false,
          message: esES.errors.email.exists,
          code: 409,
          status: 409,
          data: null,
        },
      }).as('registerWithExistingEmail');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerWithExistingEmail');

      // Verify that an error message is shown
      cy.get('body').should('contain.text', esES.errors.email.exists);

      // Verify that it stays on the register page
      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should show error toast when email already exists (in English)', () => {
      // Change language to English
      cy.get('[data-testid="language-picker-select"]').select('en-GB');

      // Fill form with valid data but existing email
      cy.get('[data-testid="register-form-email-input"]').type('existente@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call to simulate existing email
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 409,
        body: {
          success: false,
          message: enGB.errors.email.exists,
          code: 409,
          status: 409,
          data: null,
        },
      }).as('registerWithExistingEmailEn');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerWithExistingEmailEn');

      // Verify that an error message is shown in English
      cy.get('body').should('contain.text', enGB.errors.email.exists);

      // Verify that it stays on the register page
      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should allow retrying registration after an email error', () => {
      // Fill form with existing email
      cy.get('[data-testid="register-form-email-input"]').type('existente@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept first call - existing email
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 409,
        body: {
          success: false,
          message: esES.errors.email.exists,
          code: 409,
          status: 409,
          data: null,
        },
      }).as('registerWithExistingEmail');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();
      cy.wait('@registerWithExistingEmail');

      // Verify error
      cy.get('body').should('contain.text', esES.errors.email.exists);

      // Correct the email
      cy.get('[data-testid="register-form-email-input"]').clear().type('nuevo@example.com');

      // Intercept second call - successful registration
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: esES.register.success,
          code: 201,
          status: 201,
          data: {
            user: {
              id: 1,
              email: 'nuevo@example.com',
              username: 'usuarionuevo',
            },
          },
        },
      }).as('registerSuccess');

      // Submit corrected form
      cy.get('[data-testid="register-form-button"]').click();
      cy.wait('@registerSuccess');

      // Verify redirection to email verification page
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });
  });

  describe('Server error cases', () => {
    it('should show generic error message when there is an unexpected server error', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call to simulate server error
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 500,
        body: {
          success: false,
          message: esES.errors.unknown,
          code: 500,
          status: 500,
          data: null,
        },
      }).as('registerServerError');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerServerError');

      // Verify that a generic error message is shown
      cy.get('body').should('contain.text', esES.errors.unknown);

      // Verify that it stays on the register page
      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should allow retry after server error', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept first call - server error
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 500,
        body: {
          success: false,
          message: esES.errors.unknown,
          code: 500,
          status: 500,
          data: null,
        },
      }).as('registerServerError');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();
      cy.wait('@registerServerError');

      // Verify error
      cy.get('body').should('contain.text', esES.errors.unknown);

      // Intercept second call - successful registration
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: esES.register.success,
          code: 201,
          status: 201,
          data: {
            user: {
              id: 1,
              email: 'nuevo@example.com',
              username: 'usuarionuevo',
            },
          },
        },
      }).as('registerSuccess');

      // Try submitting form again
      cy.get('[data-testid="register-form-button"]').click();
      cy.wait('@registerSuccess');

      // Verify redirection to email verification page
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });

    it('should handle network errors correctly', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('nuevo@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuarionuevo');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call to simulate network error
      cy.intercept('POST', '**/api/auth/register', { forceNetworkError: true }).as(
        'registerNetworkError'
      );

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerNetworkError');

      // Verify that the button is re-enabled (doesn't stay in loading state)
      cy.get('[data-testid="register-form-button"]').should('not.be.disabled');

      // Verify that it stays on the register page
      cy.url().should('include', APP_ROUTES.REGISTER);
    });
  });
});
