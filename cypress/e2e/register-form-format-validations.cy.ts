import esES from '@infrastructure/i18n/locales/es-ES.json';
import { APP_ROUTES } from '@shared/constants/appRoutes';

// Import translations for use in tests

describe('Register Form - Format Validations', () => {
  const registerPageUrl = `${APP_ROUTES.REGISTER}`;

  beforeEach(() => {
    cy.visit(registerPageUrl);
    // Verify that the page loaded correctly
    cy.get('[data-testid="register-page"]').should('be.visible');
    cy.get('[data-testid="register-form"]').should('be.visible');
  });

  describe('Email format validation', () => {
    it('should show error with email without @', () => {
      // Fill all fields correctly except email
      cy.get('[data-testid="register-form-email-input"]').type('emailsinvalido');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Try to submit the form
      cy.get('[data-testid="register-form-button"]').click();

      // Verify that email format error appears
      cy.get('[data-testid="register-form-email-error"]')
        .should('be.visible')
        .and('contain', esES.errors.email.invalid);

      // Verify that the form was not submitted
      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should show error with email without domain', () => {
      cy.get('[data-testid="register-form-email-input"]').type('usuario@');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.get('[data-testid="register-form-email-error"]')
        .should('be.visible')
        .and('contain', esES.errors.email.invalid);

      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should show error with email without extension', () => {
      cy.get('[data-testid="register-form-email-input"]').type('usuario@dominio');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.get('[data-testid="register-form-email-error"]')
        .should('be.visible')
        .and('contain', esES.errors.email.invalid);

      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should show error with email with internal spaces', () => {
      // Use different method to insert spaces that browser can't clean automatically
      // We'll use .invoke('val', ...) instead of .type() to avoid browser processing
      cy.get('[data-testid="register-form-email-input"]')
        .invoke('val', 'usu ario@dominio.com')
        .trigger('input')
        .trigger('blur');

      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.get('[data-testid="register-form-email-error"]')
        .should('be.visible')
        .and('contain', esES.errors.email.invalid);

      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should accept valid email', () => {
      cy.get('[data-testid="register-form-email-input"]').type('usuario@dominio.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      // Should not have email error
      cy.get('[data-testid="register-form-email-error"]').should('not.be.visible');
    });
  });

  describe('Username format validation', () => {
    it('should show error with username too short (less than 3 characters)', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('ab');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.get('[data-testid="register-form-username-error"]')
        .should('be.visible')
        .and('contain', esES.errors.username.invalid);

      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should show error with username too long (more than 32 characters)', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type(
        'esteesunnombredeusuariodemasiadolargo123456789'
      );
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.get('[data-testid="register-form-username-error"]')
        .should('be.visible')
        .and('contain', esES.errors.username.invalid);

      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should show error with username with spaces', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuario test');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.get('[data-testid="register-form-username-error"]')
        .should('be.visible')
        .and('contain', esES.errors.username.invalid);

      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should show error with username with special characters', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuario@#$');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.get('[data-testid="register-form-username-error"]')
        .should('be.visible')
        .and('contain', esES.errors.username.invalid);

      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should show error with username with accents', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuáriotest');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.get('[data-testid="register-form-username-error"]')
        .should('be.visible')
        .and('contain', esES.errors.username.invalid);

      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should accept valid username (letters and numbers only)', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuario123');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      // Should not have username error
      cy.get('[data-testid="register-form-username-error"]').should('not.be.visible');
    });

    it('should accept valid username with underscores', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuario_test_123');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      // Should not have username error
      cy.get('[data-testid="register-form-username-error"]').should('not.be.visible');
    });
  });

  describe('Password format validation', () => {
    it('should show error with password too short (less than 8 characters)', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('Pass1!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Pass1!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.get('[data-testid="register-form-password-error"]')
        .should('be.visible')
        .and('contain', esES.errors.password.invalid);

      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should show error with password without uppercase letters', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.get('[data-testid="register-form-password-error"]')
        .should('be.visible')
        .and('contain', esES.errors.password.invalid);

      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should show error with password without lowercase letters', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('PASSWORD123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('PASSWORD123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.get('[data-testid="register-form-password-error"]')
        .should('be.visible')
        .and('contain', esES.errors.password.invalid);

      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should show error with password without numbers', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('Password!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.get('[data-testid="register-form-password-error"]')
        .should('be.visible')
        .and('contain', esES.errors.password.invalid);

      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should show error with password with letters only', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('PasswordSolo');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('PasswordSolo');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.get('[data-testid="register-form-password-error"]')
        .should('be.visible')
        .and('contain', esES.errors.password.invalid);

      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should accept valid password with all requirements', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      // Should not have password error
      cy.get('[data-testid="register-form-password-error"]').should('not.be.visible');
    });

    it('should accept valid password without special symbols', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('Password123');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      // Should not have password error
      cy.get('[data-testid="register-form-password-error"]').should('not.be.visible');
    });
  });

  describe('Password matching validation', () => {
    it('should show error when passwords do not match', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password456!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.get('[data-testid="register-form-confirm-password-error"]')
        .should('be.visible')
        .and('contain', esES.errors.password.mismatch);

      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should show error when passwords differ in case sensitivity', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.get('[data-testid="register-form-confirm-password-error"]')
        .should('be.visible')
        .and('contain', esES.errors.password.mismatch);

      cy.url().should('include', APP_ROUTES.REGISTER);
    });

    it('should accept passwords that match exactly', () => {
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      // Should not have password confirmation error
      cy.get('[data-testid="register-form-confirm-password-error"]').should('not.be.visible');
    });
  });

  describe('Real-time format validation', () => {
    it('should validate email in real-time on blur', () => {
      // Write invalid email
      cy.get('[data-testid="register-form-email-input"]').type('emailinvalido');
      cy.get('[data-testid="register-form-email-input"]').blur();

      // Error should appear immediately
      cy.get('[data-testid="register-form-email-error"]')
        .should('be.visible')
        .and('contain', esES.errors.email.invalid);

      // Correct email
      cy.get('[data-testid="register-form-email-input"]').clear().type('test@example.com');
      cy.get('[data-testid="register-form-email-input"]').blur();

      // Error should disappear
      cy.get('[data-testid="register-form-email-error"]').should('not.be.visible');
    });

    it('should validate password in real-time on blur', () => {
      // Write invalid password
      cy.get('[data-testid="register-form-password-input"]').type('123');
      cy.get('[data-testid="register-form-password-input"]').blur();

      // Error should appear immediately
      cy.get('[data-testid="register-form-password-error"]')
        .should('be.visible')
        .and('contain', esES.errors.password.invalid);

      // Correct password
      cy.get('[data-testid="register-form-password-input"]').clear().type('Password123!');
      cy.get('[data-testid="register-form-password-input"]').blur();

      // Error should disappear
      cy.get('[data-testid="register-form-password-error"]').should('not.be.visible');
    });
  });
});
