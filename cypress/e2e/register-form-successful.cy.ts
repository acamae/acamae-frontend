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

  describe('Successful registration with valid data', () => {
    it('should register successfully with all valid data', () => {
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
          code: 201,
          status: 201,
          data: {
            user: {
              id: 1,
              email: 'nuevo@example.com',
              username: 'usuarionuevo',
              emailVerified: false,
            },
          },
        },
      }).as('registerSuccess');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerSuccess');

      // Verify that it redirects to email verification page
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });

    it('should register successfully with valid data (in English)', () => {
      // Change language to English
      cy.get('[data-testid="language-picker-select"]').select('en-GB');

      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('newuser@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('newusername');
      cy.get('[data-testid="register-form-password-input"]').type('SecurePass123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('SecurePass123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call to simulate successful registration
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: enGB.register.success,
          code: 201,
          status: 201,
          data: {
            user: {
              id: 2,
              email: 'newuser@example.com',
              username: 'newusername',
              emailVerified: false,
            },
          },
        },
      }).as('registerSuccessEn');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerSuccessEn');

      // Verify that it redirects to email verification page
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });

    it('should show success message or instructions to verify email', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('success@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('successuser');
      cy.get('[data-testid="register-form-password-input"]').type('SuccessPass123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('SuccessPass123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept the API call to simulate successful registration
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: esES.register.success,
          code: 201,
          status: 201,
          data: {
            user: {
              id: 3,
              email: 'success@example.com',
              username: 'successuser',
              emailVerified: false,
            },
          },
        },
      }).as('registerSuccess');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerSuccess');

      // Verify redirection
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);

      // Verify that success message or instructions are shown
      // The message can be in different forms on the page
      cy.get('body').should('contain.text', 'Te hemos enviado un correo');
    });

    it('should send correct data to server', () => {
      const testData = {
        email: 'test@example.com',
        username: 'testuser123',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        terms: true,
      };

      // Fill form
      cy.get('[data-testid="register-form-email-input"]').type(testData.email);
      cy.get('[data-testid="register-form-username-input"]').type(testData.username);
      cy.get('[data-testid="register-form-password-input"]').type(testData.password);
      cy.get('[data-testid="register-form-confirm-password-input"]').type(testData.confirmPassword);
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept and verify sent data
      cy.intercept('POST', '**/api/auth/register', req => {
        // Verify that sent data is correct
        expect(req.body).to.deep.include({
          email: testData.email,
          username: testData.username,
          password: testData.password,
          confirmPassword: testData.confirmPassword,
          terms: testData.terms,
        });

        req.reply({
          statusCode: 201,
          body: {
            success: true,
            message: esES.register.success,
            code: 201,
            status: 201,
            data: {
              user: {
                id: 4,
                email: testData.email,
                username: testData.username,
                emailVerified: false,
              },
            },
          },
        });
      }).as('registerWithValidation');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerWithValidation');

      // Verify redirection
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });
  });

  describe('Form states during registration', () => {
    it('should disable button during submission', () => {
      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('loading@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('loadinguser');
      cy.get('[data-testid="register-form-password-input"]').type('LoadingPass123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('LoadingPass123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept with delay to simulate slow response
      cy.intercept('POST', '**/api/auth/register', req => {
        req.reply({
          delay: 1000, // 1 second delay
          statusCode: 201,
          body: {
            success: true,
            message: esES.register.success,
            code: 201,
            status: 201,
            data: {
              user: {
                id: 5,
                email: 'loading@example.com',
                username: 'loadinguser',
                emailVerified: false,
              },
            },
          },
        });
      }).as('registerWithDelay');

      // Verify that button is enabled initially
      cy.get('[data-testid="register-form-button"]').should('not.be.disabled');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Verify that button is disabled during submission
      cy.get('[data-testid="register-form-button"]').should('be.disabled');

      // Verify that it shows processing text
      cy.get('[data-testid="register-form-button"]').should('contain', esES.global.processing);

      // Wait for response
      cy.wait('@registerWithDelay');

      // Verify redirection (button is no longer visible)
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });

    it('should show processing text in English', () => {
      // Change language to English
      cy.get('[data-testid="language-picker-select"]').select('en-GB');

      // Fill form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('processing@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('processinguser');
      cy.get('[data-testid="register-form-password-input"]').type('ProcessPass123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('ProcessPass123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Intercept with delay
      cy.intercept('POST', '**/api/auth/register', req => {
        req.reply({
          delay: 800,
          statusCode: 201,
          body: {
            success: true,
            message: enGB.register.success,
            code: 201,
            status: 201,
            data: {
              user: {
                id: 6,
                email: 'processing@example.com',
                username: 'processinguser',
                emailVerified: false,
              },
            },
          },
        });
      }).as('registerWithDelayEn');

      // Submit form
      cy.get('[data-testid="register-form-button"]').click();

      // Verify processing text in English
      cy.get('[data-testid="register-form-button"]').should('contain', enGB.global.processing);

      // Wait for response
      cy.wait('@registerWithDelayEn');

      // Verify redirection
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });
  });

  describe('Different types of valid passwords', () => {
    it('should accept password with special symbols', () => {
      cy.get('[data-testid="register-form-email-input"]').type('symbols@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('symbolsuser');
      cy.get('[data-testid="register-form-password-input"]').type('Complex@Pass123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Complex@Pass123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: esES.register.success,
          code: 201,
          status: 201,
          data: {
            user: {
              id: 7,
              email: 'symbols@example.com',
              username: 'symbolsuser',
              emailVerified: false,
            },
          },
        },
      }).as('registerWithSymbols');

      cy.get('[data-testid="register-form-button"]').click();
      cy.wait('@registerWithSymbols');

      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });

    it('should accept password without special symbols but valid', () => {
      cy.get('[data-testid="register-form-email-input"]').type('simple@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('simpleuser');
      cy.get('[data-testid="register-form-password-input"]').type('SimplePass123');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('SimplePass123');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: esES.register.success,
          code: 201,
          status: 201,
          data: {
            user: {
              id: 8,
              email: 'simple@example.com',
              username: 'simpleuser',
              emailVerified: false,
            },
          },
        },
      }).as('registerWithSimplePass');

      cy.get('[data-testid="register-form-button"]').click();
      cy.wait('@registerWithSimplePass');

      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });

    it('should accept long valid password', () => {
      cy.get('[data-testid="register-form-email-input"]').type('long@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('longuser');
      cy.get('[data-testid="register-form-password-input"]').type(
        'ThisIsAVeryLongButValidPassword123'
      );
      cy.get('[data-testid="register-form-confirm-password-input"]').type(
        'ThisIsAVeryLongButValidPassword123'
      );
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: esES.register.success,
          code: 201,
          status: 201,
          data: {
            user: {
              id: 9,
              email: 'long@example.com',
              username: 'longuser',
              emailVerified: false,
            },
          },
        },
      }).as('registerWithLongPass');

      cy.get('[data-testid="register-form-button"]').click();
      cy.wait('@registerWithLongPass');

      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });
  });

  describe('Different types of valid usernames', () => {
    it('should accept username with numbers', () => {
      cy.get('[data-testid="register-form-email-input"]').type('numbers@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('user123456');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: esES.register.success,
          code: 201,
          status: 201,
          data: {
            user: {
              id: 10,
              email: 'numbers@example.com',
              username: 'user123456',
              emailVerified: false,
            },
          },
        },
      }).as('registerWithNumbers');

      cy.get('[data-testid="register-form-button"]').click();
      cy.wait('@registerWithNumbers');

      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });

    it('should accept username with underscores', () => {
      cy.get('[data-testid="register-form-email-input"]').type('underscore@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('user_name_test');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: esES.register.success,
          code: 201,
          status: 201,
          data: {
            user: {
              id: 11,
              email: 'underscore@example.com',
              username: 'user_name_test',
              emailVerified: false,
            },
          },
        },
      }).as('registerWithUnderscore');

      cy.get('[data-testid="register-form-button"]').click();
      cy.wait('@registerWithUnderscore');

      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });

    it('should accept username with minimum length (3 characters)', () => {
      cy.get('[data-testid="register-form-email-input"]').type('min@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('abc');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: esES.register.success,
          code: 201,
          status: 201,
          data: {
            user: {
              id: 12,
              email: 'min@example.com',
              username: 'abc',
              emailVerified: false,
            },
          },
        },
      }).as('registerWithMinLength');

      cy.get('[data-testid="register-form-button"]').click();
      cy.wait('@registerWithMinLength');

      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });

    it('should accept username with valid length (20 characters)', () => {
      const validUsername = 'a'.repeat(20); // 20 characters (within valid range)

      cy.get('[data-testid="register-form-email-input"]').type('max@example.com');
      cy.get('[data-testid="register-form-username-input"]').type(validUsername);

      // Verify that value was entered correctly
      cy.get('[data-testid="register-form-username-input"]').should('have.value', validUsername);

      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: esES.register.success,
          code: 201,
          status: 201,
          data: {
            user: {
              id: 13,
              email: 'max@example.com',
              username: validUsername,
              emailVerified: false,
            },
          },
        },
      }).as('registerWithValidLength');

      cy.get('[data-testid="register-form-button"]').click();
      cy.wait('@registerWithValidLength');

      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });
  });
});
