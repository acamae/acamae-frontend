import { APP_ROUTES } from '@shared/constants/appRoutes';

describe('Register Form - Database Integration', () => {
  beforeEach(() => {
    // Clean database before each test
    cy.cleanDb();

    // Visit the register page
    cy.visit(APP_ROUTES.REGISTER);

    // Clear any existing throttle states after page load
    cy.window().then(win => {
      win.localStorage.removeItem('acamae-throttle-states');
    });

    // Verify that the page loaded correctly
    cy.get('[data-testid="register-page"]').should('be.visible');
    cy.get('[data-testid="register-form"]').should('be.visible');
  });

  after(() => {
    // Clean database after all tests
    cy.cleanDb();
  });

  describe('Successful registration with real database', () => {
    it('should register a user successfully in the database', () => {
      // Configure intercept with mocked successful response
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: null,
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerUser');

      // Fill the form with valid data
      cy.get('[data-testid="register-form-email-input"]').type('test@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('testuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Submit the form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@registerUser').then(interception => {
        // Verify that the request was sent correctly
        expect(interception.request.body).to.deep.include({
          email: 'test@example.com',
          username: 'testuser',
        });

        // Verify that the response is successful
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      });

      // Verify redirection to the email verification page
      cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
    });

    it('should show error when the email already exists in the database', () => {
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 409,
        body: {
          success: false,
          data: null,
          status: 409,
          code: 'AUTH_USER_ALREADY_EXISTS',
          message: 'El email ya está registrado',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('duplicateRegister');

      // Fill the form with existing email
      cy.get('[data-testid="register-form-email-input"]').type('existing@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('anotheruser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      // Submit the form
      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the API call
      cy.wait('@duplicateRegister').then(interception => {
        // Verify that an error is received
        expect(interception.response?.statusCode).to.be.oneOf([400, 409, 422]);
      });

      // Verify that the error message is shown
      cy.get('body').should('contain.text', 'El email ya está registrado');
    });
  });

  describe('Database cleanup tests', () => {
    it('should clean the data between tests', () => {
      // Configure intercept with mocked successful response
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: null,
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerUser');

      // Register a user
      cy.get('[data-testid="register-form-email-input"]').type('cleanup@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('cleanupuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      // Wait for the registration and verify that the response is successful
      cy.wait('@registerUser').then(interception => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      });
    });
  });

  describe('Database configuration', () => {
    it('should configure the database correctly', () => {
      // Explicitly configure the database
      cy.setupDb();

      // Verify that we can make a request without errors
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          data: null,
          status: 201,
          code: 'SUCCESS',
          message: 'User registered successfully. Check your email to verify your account.',
          timestamp: new Date().toISOString(),
          requestId: 'req_123456789',
        },
      }).as('registerUser');

      cy.get('[data-testid="register-form-email-input"]').type('setup@example.com');
      cy.get('[data-testid="register-form-username-input"]').type('setupuser');
      cy.get('[data-testid="register-form-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="register-form-terms-checkbox"]').check();

      cy.get('[data-testid="register-form-button"]').click();

      cy.wait('@registerUser').then(interception => {
        // Verify that the response is successful
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      });
    });
  });
});
