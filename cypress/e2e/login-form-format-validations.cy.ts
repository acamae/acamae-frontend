import { APP_ROUTES } from '@shared/constants/appRoutes';

describe('Login Form - Format Validations', () => {
  beforeEach(() => {
    cy.visit(APP_ROUTES.LOGIN);
    cy.get('[data-testid="login-page"]').should('be.visible');
    cy.get('[data-testid="login-form"]').should('be.visible');
  });

  describe('Email Format Validations', () => {
    it('should validate email format correctly', () => {
      // Test invalid email formats
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test..test@example.com',
        'test@example..com',
        'test@example',
        'test@.com',
        'test@example.',
      ];

      invalidEmails.forEach(email => {
        cy.get('[data-testid="login-form-email-input"]').clear().type(email).blur();
        cy.get('[data-testid="login-form-email-error"]').should('be.visible');
        cy.get('[data-testid="login-form-email-error"]').should(
          'contain.text',
          'Por favor, introduce un email válido.'
        );
        cy.get('[data-testid="login-form-button"]').should('be.disabled');
      });
    });

    it('should accept valid email formats', () => {
      // Test valid email formats
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ];

      validEmails.forEach(email => {
        cy.get('[data-testid="login-form-email-input"]').clear().type(email).blur();
        // Wait for validation to complete
        cy.wait(500);
        cy.get('[data-testid="login-form-email-error"]').should('not.be.visible');
      });
    });
  });

  describe('Password Format Validations', () => {
    it('should validate password strength correctly', () => {
      // Test weak passwords
      const weakPasswords = ['weak', '123456', 'password', 'abc123', 'qwerty'];

      weakPasswords.forEach(password => {
        cy.get('[data-testid="login-form-password-input"]').clear().type(password).blur();
        cy.get('[data-testid="login-form-password-error"]').should('be.visible');
        cy.get('[data-testid="login-form-password-error"]').should(
          'contain.text',
          'La contraseña debe tener mínimo 8 caracteres, al menos una letra mayúscula, una minúscula y un número.'
        );
        cy.get('[data-testid="login-form-button"]').should('be.disabled');
      });
    });

    it('should accept strong passwords', () => {
      // Test strong passwords
      const strongPasswords = ['Password123!', 'SecurePass456@', 'MyP@ssw0rd', 'Str0ng!Pass'];

      strongPasswords.forEach(password => {
        cy.get('[data-testid="login-form-password-input"]').clear().type(password).blur();
        // Wait for validation to complete
        cy.wait(500);
        cy.get('[data-testid="login-form-password-error"]').should('not.be.visible');
      });
    });
  });

  describe('Required Field Validations', () => {
    it('should show required errors for empty fields', () => {
      cy.get('[data-testid="login-form-button"]').click();

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

      cy.get('[data-testid="login-form-button"]').should('be.disabled');
    });

    it('should clear errors when valid data is entered', () => {
      // Trigger errors
      cy.get('[data-testid="login-form-button"]').click();
      cy.get('[data-testid="login-form-email-error"]').should('be.visible');

      // Enter valid data
      cy.get('[data-testid="login-form-email-input"]').type('test@example.com').blur();
      cy.get('[data-testid="login-form-password-input"]').type('Password123!').blur();

      // Wait for validation to update
      cy.wait(1000);

      // Errors should be cleared
      cy.get('[data-testid="login-form-email-error"]').should('not.be.visible');
      cy.get('[data-testid="login-form-password-error"]').should('not.be.visible');
      cy.get('[data-testid="login-form-button"]').should('be.enabled');
    });
  });
});
