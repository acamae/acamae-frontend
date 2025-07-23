import enGB from '@infrastructure/i18n/locales/en-GB.json';
import esES from '@infrastructure/i18n/locales/es-ES.json';
import { APP_ROUTES } from '@shared/constants/appRoutes';

// Import translations for comparison

describe('Register Form - Internationalization', () => {
  const registerPageUrl = `${APP_ROUTES.REGISTER}`;

  beforeEach(() => {
    cy.visit(registerPageUrl);
    // Verify that the page loaded correctly
    cy.get('[data-testid="register-page"]').should('be.visible');
    cy.get('[data-testid="register-form"]').should('be.visible');
  });

  describe('Language change - Spanish to English', () => {
    it('should display form in Spanish by default', () => {
      // Verify that the title is in Spanish
      cy.get('[data-testid="register-page-title"]')
        .should('be.visible')
        .and('contain', esES.register.title);

      // Verify labels in Spanish
      cy.contains('label', esES.register.email).should('be.visible');
      cy.contains('label', esES.register.username).should('be.visible');
      cy.contains('label', esES.register.password).should('be.visible');
      cy.contains('label', esES.register.confirm_password).should('be.visible');

      // Verify button in Spanish
      cy.get('[data-testid="register-form-button"]').should('contain', esES.register.button);
    });

    it('should change all texts to English when language is selected', () => {
      // Verify that initially it's in Spanish
      cy.get('[data-testid="register-page-title"]').should('contain', esES.register.title);

      // Change language using the language selector
      cy.get('[data-testid="language-picker-select"]').select('en-GB');

      // Verify that the title changed to English
      cy.get('[data-testid="register-page-title"]')
        .should('be.visible')
        .and('contain', enGB.register.title);

      // Verify labels in English
      cy.contains('label', enGB.register.email).should('be.visible');
      cy.contains('label', enGB.register.username).should('be.visible');
      cy.contains('label', enGB.register.password).should('be.visible');
      cy.contains('label', enGB.register.confirm_password).should('be.visible');

      // Verify button in English
      cy.get('[data-testid="register-form-button"]').should('contain', enGB.register.button);

      // Verify that the selector shows "English" (in English)
      cy.get('[data-testid="language-picker-select"] option:selected').should(
        'contain',
        enGB.language['en-GB']
      );
    });

    it('should show error messages in English when language is set to English', () => {
      // Change language to English
      cy.window().then(win => {
        win.localStorage.setItem('i18nextLng', 'en-GB');
        cy.reload();
      });

      // Generate errors by submitting empty form
      cy.get('[data-testid="register-form-button"]').click();

      // Verify error messages in English
      cy.get('[data-testid="register-form-email-error"]')
        .should('be.visible')
        .and('contain', enGB.errors.email.invalid);

      cy.get('[data-testid="register-form-username-error"]')
        .should('be.visible')
        .and('contain', enGB.errors.username.invalid);

      cy.get('[data-testid="register-form-password-error"]')
        .should('be.visible')
        .and('contain', enGB.errors.password.invalid);

      cy.get('[data-testid="register-form-confirm-password-error"]')
        .should('be.visible')
        .and('contain', enGB.errors.password.confirm_required);

      cy.get('[data-testid="register-form-terms-error"]')
        .should('be.visible')
        .and('contain', enGB.errors.terms.required);
    });

    it('should show error messages in Spanish when language is set to Spanish', () => {
      // Ensure Spanish language
      cy.window().then(win => {
        win.localStorage.setItem('i18nextLng', 'es-ES');
        cy.reload();
      });

      // Generate errors by submitting empty form
      cy.get('[data-testid="register-form-button"]').click();

      // Verify error messages in Spanish
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
    });
  });

  describe('Password mismatch validation multilingual', () => {
    it('should show password mismatch error in Spanish', () => {
      // Ensure Spanish language
      cy.window().then(win => {
        win.localStorage.setItem('i18nextLng', 'es-ES');
        cy.reload();
      });

      // Fill form with different passwords
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-email-input"]').blur();
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-username-input"]').blur();
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-password-input"]').blur();
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password456!');
      cy.get('[data-testid="register-form-confirm-password-input"]').blur();
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Submit form to trigger validation
      cy.get('[data-testid="register-form"]').submit();

      cy.get('[data-testid="register-form-confirm-password-error"]')
        .should('be.visible')
        .and('contain', esES.errors.password.mismatch);
    });

    it('should show password mismatch error in English', () => {
      // Change language to English
      cy.window().then(win => {
        win.localStorage.setItem('i18nextLng', 'en-GB');
        cy.reload();
      });

      // Fill form with different passwords
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-email-input"]').blur();
      cy.get('[data-testid="register-form-username-input"]').type('usuariotest');
      cy.get('[data-testid="register-form-username-input"]').blur();
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-password-input"]').blur();
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password456!');
      cy.get('[data-testid="register-form-confirm-password-input"]').blur();
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Submit form to trigger validation
      cy.get('[data-testid="register-form"]').submit();

      cy.get('[data-testid="register-form-confirm-password-error"]')
        .should('be.visible')
        .and('contain', enGB.errors.password.mismatch);
    });
  });

  describe('Help texts multilingual', () => {
    it('should show help texts in Spanish', () => {
      // Ensure Spanish language
      cy.window().then(win => {
        win.localStorage.setItem('i18nextLng', 'es-ES');
        cy.reload();
      });

      // Verify help texts in Spanish
      cy.contains(esES.register.email_help).should('be.visible');
      cy.contains(esES.register.username_help).should('be.visible');
      cy.contains(esES.register.password_help).should('be.visible');
      cy.contains(esES.register.confirm_password_help).should('be.visible');
    });

    it('should show help texts in English', () => {
      // Change language to English
      cy.window().then(win => {
        win.localStorage.setItem('i18nextLng', 'en-GB');
        cy.reload();
      });

      // Verify help texts in English
      cy.contains(enGB.register.email_help).should('be.visible');
      cy.contains(enGB.register.username_help).should('be.visible');
      cy.contains(enGB.register.password_help).should('be.visible');
      cy.contains(enGB.register.confirm_password_help).should('be.visible');
    });
  });

  describe('Language persistence', () => {
    it('should remember selected language after page reload', () => {
      // Change language to English
      cy.window().then(win => {
        win.localStorage.setItem('i18nextLng', 'en-GB');
        cy.reload();
      });

      // Verify that it's in English
      cy.get('[data-testid="register-page-title"]').should('contain', enGB.register.title);

      // Reload page
      cy.reload();

      // Verify that it's still in English
      cy.get('[data-testid="register-page-title"]').should('contain', enGB.register.title);
    });

    it('should use Spanish as default language', () => {
      // Clear localStorage
      cy.window().then(win => {
        win.localStorage.removeItem('i18nextLng');
        cy.reload();
      });

      // Verify that it's in Spanish by default
      cy.get('[data-testid="register-page-title"]').should('contain', esES.register.title);
    });
  });

  describe('Dynamic language change', () => {
    it('should change error messages dynamically when language is changed', () => {
      // Generate errors in Spanish
      cy.get('[data-testid="register-form-button"]').click();

      // Verify error in Spanish
      cy.get('[data-testid="register-form-email-error"]')
        .should('be.visible')
        .and('contain', esES.errors.email.invalid);

      // Change language to English
      cy.window().then(win => {
        win.localStorage.setItem('i18nextLng', 'en-GB');
        cy.reload();
      });

      // Generate errors again
      cy.get('[data-testid="register-form-button"]').click();

      // Verify that the error is now in English
      cy.get('[data-testid="register-form-email-error"]')
        .should('be.visible')
        .and('contain', enGB.errors.email.invalid);
    });
  });
});
