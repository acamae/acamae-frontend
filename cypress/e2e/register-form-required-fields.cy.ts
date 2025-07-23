import esES from '@infrastructure/i18n/locales/es-ES.json';
import { APP_ROUTES } from '@shared/constants/appRoutes';

// Import translations for use in tests

describe('Register Form - Required Fields Validations', () => {
  const registerPageUrl = `${APP_ROUTES.REGISTER}`;

  beforeEach(() => {
    cy.visit(registerPageUrl);
    // Verify that the page loaded correctly
    cy.get('[data-testid="register-page"]').should('be.visible');
    cy.get('[data-testid="register-form"]').should('be.visible');
  });

  describe('Try registration with all fields empty', () => {
    it('should show error messages on all required fields', () => {
      // Click register button without filling any field
      cy.get('[data-testid="register-form-button"]').click();

      // Verify that error messages appear for all required fields
      cy.get('[data-testid="register-form-email-error"]')
        .should('be.visible')
        .and('contain', esES.errors.email.invalid);

      cy.get('[data-testid="register-form-username-error"]')
        .should('be.visible')
        .and('contain', esES.errors.username.invalid);

      cy.get('[data-testid="register-form-password-error"]')
        .should('be.visible')
        .and('contain', esES.errors.password.invalid);

      cy.get('[data-testid="register-form-confirm-password-error"]')
        .should('be.visible')
        .and('contain', esES.errors.password.confirm_required);

      cy.get('[data-testid="register-form-terms-error"]')
        .should('be.visible')
        .and('contain', esES.errors.terms.required);

      // Verify that the form was not submitted (we stay on the register page)
      cy.url().should('include', APP_ROUTES.REGISTER);
    });
  });

  describe('Empty email field', () => {
    it('should show error message only on email field', () => {
      // Fill all fields except email
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Submit the form (not click the button)
      cy.get('[data-testid="register-form"]').submit();

      // Verify that only email error appears
      cy.get('[data-testid="register-form-email-error"]')
        .should('be.visible')
        .and('contain', esES.errors.email.invalid);

      // Verify that no errors appear on other fields (that are filled)
      cy.get('[data-testid="register-form-username-error"]').should('not.be.visible');
      cy.get('[data-testid="register-form-password-error"]').should('not.be.visible');
      cy.get('[data-testid="register-form-confirm-password-error"]').should('not.be.visible');
      cy.get('[data-testid="register-form-terms-error"]').should('not.be.visible');

      // Verify that the button is disabled when there are validation errors
      cy.get('[data-testid="register-form-button"]').should('be.disabled');

      // Verify that the form was not submitted
      cy.url().should('include', APP_ROUTES.REGISTER);
    });
  });

  describe('Empty username field', () => {
    it('should show error message only on username field', () => {
      // Fill all fields except username
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Submit the form (not click the button)
      cy.get('[data-testid="register-form"]').submit();

      // Verify that only username error appears
      cy.get('[data-testid="register-form-username-error"]')
        .should('be.visible')
        .and('contain', esES.errors.username.invalid);

      // Verify that no errors appear on other fields (that are filled)
      cy.get('[data-testid="register-form-email-error"]').should('not.be.visible');
      cy.get('[data-testid="register-form-password-error"]').should('not.be.visible');
      cy.get('[data-testid="register-form-confirm-password-error"]').should('not.be.visible');
      cy.get('[data-testid="register-form-terms-error"]').should('not.be.visible');

      // Verify that the button is disabled when there are validation errors
      cy.get('[data-testid="register-form-button"]').should('be.disabled');

      // Verify that the form was not submitted
      cy.url().should('include', APP_ROUTES.REGISTER);
    });
  });

  describe('Empty password field', () => {
    it('should show error message only on password field', () => {
      // Fill all fields except password
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Submit the form (not click the button)
      cy.get('[data-testid="register-form"]').submit();

      // Verify that errors appear on password and confirmation
      cy.get('[data-testid="register-form-password-error"]')
        .should('be.visible')
        .and('contain', esES.errors.password.invalid);

      cy.get('[data-testid="register-form-confirm-password-error"]')
        .should('be.visible')
        .and('contain', esES.errors.password.mismatch);

      // Verify that no errors appear on other fields (that are filled)
      cy.get('[data-testid="register-form-email-error"]').should('not.be.visible');
      cy.get('[data-testid="register-form-username-error"]').should('not.be.visible');
      cy.get('[data-testid="register-form-terms-error"]').should('not.be.visible');

      // Verify that the button is disabled when there are validation errors
      cy.get('[data-testid="register-form-button"]').should('be.disabled');

      // Verify that the form was not submitted
      cy.url().should('include', APP_ROUTES.REGISTER);
    });
  });

  describe('Empty password confirmation field', () => {
    it('should show error message only on confirmation field', () => {
      // Fill all fields except password confirmation
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Submit the form (not click the button)
      cy.get('[data-testid="register-form"]').submit();

      // Verify that only password confirmation error appears
      cy.get('[data-testid="register-form-confirm-password-error"]')
        .should('be.visible')
        .and('contain', esES.errors.password.confirm_required);

      // Verify that no errors appear on other fields (that are filled)
      cy.get('[data-testid="register-form-email-error"]').should('not.be.visible');
      cy.get('[data-testid="register-form-username-error"]').should('not.be.visible');
      cy.get('[data-testid="register-form-password-error"]').should('not.be.visible');
      cy.get('[data-testid="register-form-terms-error"]').should('not.be.visible');

      // Verify that the button is disabled when there are validation errors
      cy.get('[data-testid="register-form-button"]').should('be.disabled');

      // Verify that the form was not submitted
      cy.url().should('include', APP_ROUTES.REGISTER);
    });
  });

  describe('Terms and conditions checkbox unchecked', () => {
    it('should show error message only on terms field', () => {
      // Fill all fields except checking terms
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');

      // Submit the form (not click the button)
      cy.get('[data-testid="register-form"]').submit();

      // Verify that only terms and conditions error appears
      cy.get('[data-testid="register-form-terms-error"]')
        .should('be.visible')
        .and('contain', esES.errors.terms.required);

      // Verify that no errors appear on other fields (that are filled)
      cy.get('[data-testid="register-form-email-error"]').should('not.be.visible');
      cy.get('[data-testid="register-form-username-error"]').should('not.be.visible');
      cy.get('[data-testid="register-form-password-error"]').should('not.be.visible');
      cy.get('[data-testid="register-form-confirm-password-error"]').should('not.be.visible');

      // Verify that the button is disabled when there are validation errors
      cy.get('[data-testid="register-form-button"]').should('be.disabled');

      // Verify that the form was not submitted
      cy.url().should('include', APP_ROUTES.REGISTER);
    });
  });

  describe('Real-time validation behavior', () => {
    it('should hide error messages when fields are corrected', () => {
      // First generate errors by submitting form without data
      cy.get('[data-testid="register-form"]').submit();

      // Verify that errors appear
      cy.get('[data-testid="register-form-email-error"]').should('be.visible');
      cy.get('[data-testid="register-form-username-error"]').should('be.visible');

      // Correct email field
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');

      // Email error should disappear after writing valid email and blur
      cy.get('[data-testid="register-form-email-input"]').blur();
      cy.get('[data-testid="register-form-email-error"]').should('not.be.visible');

      // Correct username field
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-username-input"]').blur();
      cy.get('[data-testid="register-form-username-error"]').should('not.be.visible');

      // Terms error remains until checkbox is checked
      cy.get('[data-testid="register-form-terms-error"]').should('be.visible');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();
      cy.get('[data-testid="register-form-terms-error"]').should('not.be.visible');
    });
  });

  describe('Accessibility in validations', () => {
    it('should maintain focus on fields with errors and be navigable by keyboard', () => {
      // Verify that all fields are accessible by keyboard
      cy.get('[data-testid="register-form-email-input"]').focus().should('have.focus');
      cy.get('[data-testid="register-form-username-input"]').focus().should('have.focus');
      cy.get('[data-testid="register-form-password-input"]').focus().should('have.focus');
      cy.get('[data-testid="btn-toggle-password"]').focus().should('have.focus');
      cy.get('[data-testid="register-form-confirm-password-input"]').focus().should('have.focus');
      cy.get('[data-testid="btn-toggle-confirm-password"]').focus().should('have.focus');
      cy.get('[data-testid="register-form-terms-checkbox"]').focus().should('have.focus');
      cy.get('[data-testid="register-form-button"]').focus().should('have.focus');

      // Submit form to generate errors
      cy.get('[data-testid="register-form"]').submit();

      // Verify that errors have appropriate accessibility attributes
      cy.get('[data-testid="register-form-email-error"]')
        .should('be.visible')
        .and('have.attr', 'data-testid');

      // Verify that input fields have appropriate ARIA attributes
      cy.get('[data-testid="register-form-email-input"]').should('have.attr', 'aria-describedby');

      cy.get('[data-testid="register-form-username-input"]').should(
        'have.attr',
        'aria-describedby'
      );
    });
  });
});
