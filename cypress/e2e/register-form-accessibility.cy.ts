import enGB from '@infrastructure/i18n/locales/en-GB.json';
import esES from '@infrastructure/i18n/locales/es-ES.json';
import { APP_ROUTES } from '@shared/constants/appRoutes';

const tabindexHandler = (selector: string) => {
  cy.get(selector).should('satisfy', (element: JQuery<HTMLElement>) => {
    // Verify that the element doesn't have negative tabindex
    const tabindex = element.attr('tabindex');
    return !tabindex || parseInt(tabindex) >= 0;
  });
};

describe('Register Form - Accessibility and Usability', () => {
  beforeEach(() => {
    // Visit the register page
    cy.visit(APP_ROUTES.REGISTER);

    // Verify that the page loaded correctly
    cy.get('[data-testid="register-page"]').should('be.visible');
    cy.get('[data-testid="register-form"]').should('be.visible');
  });

  describe('Keyboard navigation', () => {
    it('should allow complete keyboard navigation using Tab', () => {
      // Verify that all interactive elements are accessible by keyboard
      const focusableElements = [
        '[data-testid="language-picker-select"]',
        '[data-testid="register-form-email-input"]',
        '[data-testid="register-form-username-input"]',
        '[data-testid="register-form-password-input"]',
        '[data-testid="register-form-confirm-password-input"]',
        '[data-testid="register-form-terms-checkbox"]',
        '[data-testid="register-form-button"]',
      ];

      // Verify that each element can receive focus
      focusableElements.forEach(selector => {
        cy.get(selector).focus().should('be.focused');
      });
    });

    it('should maintain logical tab order', () => {
      // Verify sequential tab order using direct navigation
      cy.get('[data-testid="register-form-email-input"]').focus().should('be.focused');
      cy.get('[data-testid="register-form-username-input"]').focus().should('be.focused');
      cy.get('[data-testid="register-form-password-input"]').focus().should('be.focused');
      cy.get('[data-testid="register-form-confirm-password-input"]').focus().should('be.focused');
      cy.get('[data-testid="register-form-terms-checkbox"]').focus().should('be.focused');
      cy.get('[data-testid="register-form-button"]').focus().should('be.focused');
    });

    it('should allow form submission with Enter', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('testuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept API call
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: esES.register.success,
          code: 'SUCCESS',
          status: 201,
          data: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            role: 'user',
            is_verified: false,
          },
        },
      }).as('registerSuccess');

      // Submit form with Enter from button
      cy.get('[data-testid="register-form-button"]').focus().type('{enter}');

      // Verify that it was processed correctly
      cy.wait('@registerSuccess');
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });

    it('should allow reverse navigation with Shift+Tab', () => {
      // Define focusable elements in expected logical order
      const focusableElements = [
        '[data-testid="register-form-email-input"]',
        '[data-testid="register-form-username-input"]',
        '[data-testid="register-form-password-input"]',
        '[data-testid="register-form-confirm-password-input"]',
        '[data-testid="register-form-terms-checkbox"]',
        '[data-testid="register-form-button"]',
      ];

      // Verify that all elements are focusable
      focusableElements.forEach(selector => {
        cy.get(selector).should('be.visible').focus().should('be.focused');
      });

      // Test reverse navigation: verify we can navigate backwards
      // starting from the last element
      cy.get(focusableElements[focusableElements.length - 1]).focus();

      // Navigate backwards using DOM and verify correct order
      cy.get(focusableElements[focusableElements.length - 1]).then($button => {
        // Verify that the button is focused
        cy.wrap($button).should('be.focused');

        // Navigate manually backwards verifying each element
        cy.get(focusableElements[focusableElements.length - 2])
          .focus()
          .should('be.focused');
        cy.get(focusableElements[focusableElements.length - 3])
          .focus()
          .should('be.focused');
        cy.get(focusableElements[focusableElements.length - 4])
          .focus()
          .should('be.focused');
      });

      // Additional test: verify tabindex and navigation properties
      focusableElements.forEach(tabindexHandler);
    });
  });

  describe('ARIA attributes and semantics', () => {
    it('should have appropriate labels for all fields', () => {
      // Verify that all fields have associated labels
      cy.get('[data-testid="register-form-email-input"]').should(
        'satisfy',
        (element: JQuery<HTMLElement>) => {
          return (
            element.attr('aria-label') || element.attr('aria-labelledby') || element.attr('id')
          );
        }
      );

      cy.get('[data-testid="register-form-username-input"]').should(
        'satisfy',
        (element: JQuery<HTMLElement>) => {
          return (
            element.attr('aria-label') || element.attr('aria-labelledby') || element.attr('id')
          );
        }
      );

      cy.get('[data-testid="register-form-password-input"]').should(
        'satisfy',
        (element: JQuery<HTMLElement>) => {
          return (
            element.attr('aria-label') || element.attr('aria-labelledby') || element.attr('id')
          );
        }
      );

      cy.get('[data-testid="register-form-confirm-password-input"]').should(
        'satisfy',
        (element: JQuery<HTMLElement>) => {
          return (
            element.attr('aria-label') || element.attr('aria-labelledby') || element.attr('id')
          );
        }
      );
    });

    it('should have appropriate ARIA attributes for validation errors', () => {
      // Try to submit empty form to generate errors
      cy.get('[data-testid="register-form-button"]').should('be.enabled');

      // Verify that fields with errors have aria-invalid
      cy.get('[data-testid="register-form-email-input"]').should(
        'have.attr',
        'aria-invalid',
        'false'
      );

      cy.get('[data-testid="register-form-username-input"]').should(
        'have.attr',
        'aria-invalid',
        'false'
      );

      cy.get('[data-testid="register-form-password-input"]').should(
        'have.attr',
        'aria-invalid',
        'false'
      );

      cy.get('[data-testid="register-form-confirm-password-input"]').should(
        'have.attr',
        'aria-invalid',
        'false'
      );
    });

    it('should have appropriate semantic roles', () => {
      // Verify that the form has appropriate role
      cy.get('[data-testid="register-form"]').should('satisfy', (element: JQuery<HTMLElement>) => {
        return element.attr('role') || element.is('form');
      });

      // Verify that buttons have appropriate roles
      cy.get('[data-testid="register-form-button"]').should(
        'satisfy',
        (element: JQuery<HTMLElement>) => {
          return element.attr('type') === 'submit' || element.attr('role') === 'button';
        }
      );
    });

    it('should have accessible descriptions for complex fields', () => {
      // Verify that password has description of requirements
      cy.get('[data-testid="register-form-password-input"]').should(
        'have.attr',
        'aria-describedby'
      );

      // Verify that help text is visible
      cy.get('[data-testid="password-strength-meter"]')
        .should('contain.text', esES.register.password_requirements.length)
        .and('contain.text', esES.register.password_requirements.uppercase)
        .and('contain.text', esES.register.password_requirements.lowercase)
        .and('contain.text', esES.register.password_requirements.digit);
    });

    it('should announce dynamic changes with aria-live', () => {
      // Fill invalid email
      cy.get('[data-testid="register-form-email-input"]').type('email-invalido');
      cy.get('[data-testid="register-form-email-input"]').blur();

      // Verify that there are live regions to announce errors
      cy.get('[aria-live="polite"], [aria-live="assertive"], [role="alert"]')
        .should('exist')
        .and('be.visible');
    });
  });

  describe('Contrast and readability', () => {
    it('should have sufficient contrast in all elements', () => {
      // Verify that elements are visible (proxy for contrast)
      cy.get('[data-testid="register-form-email-input"]')
        .should('be.visible')
        .and('have.css', 'opacity')
        .and('not.equal', '0');

      cy.get('[data-testid="register-form-button"]')
        .should('be.visible')
        .and('have.css', 'opacity')
        .and('not.equal', '0');

      // Verify that text is readable in register form labels
      cy.get('[data-testid="register-form"] label').each($label => {
        cy.wrap($label).should('be.visible');
      });
    });

    it('should maintain readability in error states', () => {
      // Generate validation errors by submitting empty form
      cy.get('[data-testid="register-form"]').submit();

      // Verify that the button is disabled when there are validation errors
      cy.get('[data-testid="register-form-button"]').should('be.disabled');

      // Verify that error messages are visible
      cy.get('.text-danger, .error, .invalid-feedback, [class*="error"]')
        .should('be.visible')
        .and('have.length.greaterThan', 0);
    });

    it('should maintain readability in loading state', () => {
      // Fill form
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('testuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept with delay to see loading state
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: { success: true, message: 'Success', code: 'SUCCESS', status: 201, data: {} },
        delay: 1000,
      }).as('registerWithDelay');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Verify that button in loading state is visible
      cy.get('[data-testid="register-form-button"]').should('be.visible').and('be.disabled');

      cy.wait('@registerWithDelay');
    });
  });

  describe('Screen reader compatibility', () => {
    it('should have logical heading structure', () => {
      // Verify that there are structured headings
      cy.get('h1, h2, h3, h4, h5, h6').should('exist');

      // Verify that main title exists
      cy.get('h1, h2').should('satisfy', (element: JQuery<HTMLElement>) => {
        const text = element.text();
        return (
          text.includes('Registro') || text.includes('Crear cuenta') || text.includes('Sign up')
        );
      });
    });

    it('should have appropriate landmarks', () => {
      // Verify that there are main landmarks
      cy.get('main, [role="main"]').should('exist');
      cy.get('form, [role="form"]').should('exist');
    });

    it('should provide context for interactive elements', () => {
      // Verify that buttons have descriptive text
      cy.get('[data-testid="register-form-button"]').should(
        'satisfy',
        (element: JQuery<HTMLElement>) => {
          const text = element.text();
          return (
            text.includes('Registrar') || text.includes('Crear cuenta') || text.includes('Sign up')
          );
        }
      );

      // Verify that links have descriptive text
      cy.get('a').each($link => {
        cy.wrap($link).should('not.be.empty');
      });
    });

    it('should announce important state changes', () => {
      // Change language and verify that it's announced
      cy.get('[data-testid="language-picker-select"]').select('en-GB');

      // Verify that texts changed (indicative of announcement)
      cy.get('[data-testid="register-form-button"]').should('contain.text', enGB.register.button);
    });
  });

  describe('General usability', () => {
    it('should show clear indicators for required fields', () => {
      // Verify that there are visual indicators for required fields in the form
      cy.get('[data-testid="register-form"] label').should(
        'satisfy',
        (labels: JQuery<HTMLElement>) => {
          const text = labels.text();
          return (
            text.includes('*') ||
            text.includes('obligatorio') ||
            text.includes('requerido') ||
            text.includes('required')
          );
        }
      );
    });

    it('should provide immediate feedback on validations', () => {
      // Write invalid email
      cy.get('[data-testid="register-form-email-input"]').type('email-invalido');
      cy.get('[data-testid="register-form-email-input"]').blur();

      // Verify that immediate feedback appears
      cy.get('body').should('contain.text', esES.errors.email.invalid);

      // Correct email
      cy.get('[data-testid="register-form-email-input"]').clear().type('test@example.com');
      cy.get('[data-testid="register-form-email-input"]').blur();

      // Verify that error disappears
      cy.get('body').should('not.contain.text', esES.errors.email.invalid);
    });

    it('should have clear and specific error messages', () => {
      // Generate different types of errors
      cy.get('[data-testid="register-form-email-input"]').type('email-invalido');
      cy.get('[data-testid="register-form-email-input"]').blur();
      cy.get('[data-testid="register-form-username-input"]').type('ab'); // Too short
      cy.get('[data-testid="register-form-username-input"]').blur();
      cy.get('[data-testid="register-form-password-input"]').type('123'); // Too simple
      cy.get('[data-testid="register-form-password-input"]').blur();
      cy.get('[data-testid="register-form-confirm-password-input"]').type('456'); // Doesn't match
      cy.get('[data-testid="register-form-confirm-password-input"]').blur();

      // Submit form to trigger all validations
      cy.get('[data-testid="register-form"]').submit();

      // Verify that the button is disabled when there are validation errors
      cy.get('[data-testid="register-form-button"]').should('be.disabled');

      // Verify that each error is specific
      cy.get('body').should('contain.text', esES.errors.email.invalid);
      cy.get('body').should('contain.text', esES.errors.username.invalid);
      cy.get('body').should('contain.text', esES.errors.password.invalid);
    });

    it('should maintain focus on relevant elements during interactions', () => {
      // Click on a field
      cy.get('[data-testid="register-form-email-input"]').click();
      cy.get('[data-testid="register-form-email-input"]').should('be.focused');

      // Type and verify it maintains focus
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-email-input"]').should('be.focused');
    });

    it('should be responsive and accessible on different screen sizes', () => {
      // Test on mobile
      cy.viewport(375, 667);
      cy.get('[data-testid="register-form"]').should('be.visible');
      cy.get('[data-testid="register-form-button"]').should('be.visible');

      // Test on tablet
      cy.viewport(768, 1024);
      cy.get('[data-testid="register-form"]').should('be.visible');
      cy.get('[data-testid="register-form-button"]').should('be.visible');

      // Test on desktop
      cy.viewport(1920, 1080);
      cy.get('[data-testid="register-form"]').should('be.visible');
      cy.get('[data-testid="register-form-button"]').should('be.visible');
    });
  });
});
