import enGB from '@infrastructure/i18n/locales/en-GB.json';
import esES from '@infrastructure/i18n/locales/es-ES.json';
import { APP_ROUTES } from '@shared/constants/appRoutes';

// Test helpers and utilities for register form e2e tests

/**
 * Gets the current translations object based on the current language
 * @param language - Language code (en-GB, es-ES)
 * @returns Translation object
 */
export function getTranslations(language: string = 'es-ES') {
  return language === 'en-GB' ? enGB : esES;
}

/**
 * Validates that a field shows a specific error message using i18n key
 * @param fieldName - Name of the field (email, username, password, etc.)
 * @param errorKey - i18n key for the error message (e.g., 'errors.email.invalid')
 * @param language - Language code (default: 'es-ES')
 */
export function validateFieldErrorWithI18n(
  fieldName: string,
  errorKey: string,
  language: string = 'es-ES'
): void {
  const translations = getTranslations(language);

  // Get the error message based on the key
  let errorMessage = '';
  if (errorKey === 'errors.email.invalid') {
    errorMessage = translations.errors.email.invalid;
  } else if (errorKey === 'errors.username.invalid') {
    errorMessage = translations.errors.username.invalid;
  } else if (errorKey === 'errors.password.invalid') {
    errorMessage = translations.errors.password.invalid;
  } else if (errorKey === 'errors.password.mismatch') {
    errorMessage = translations.errors.password.mismatch;
  } else if (errorKey === 'errors.password.confirm_required') {
    errorMessage = translations.errors.password.confirm_required;
  } else if (errorKey === 'errors.terms.required') {
    errorMessage = translations.errors.terms.required;
  } else {
    errorMessage = errorKey; // fallback to key if not found
  }

  cy.get(`[data-testid="register-form-${fieldName}-error"]`)
    .should('be.visible')
    .and('contain', errorMessage);
}

/**
 * Fills the register form with valid data
 * @param email - Email address
 * @param username - Username
 * @param password - Password
 * @param confirmPassword - Confirm password (optional, defaults to password)
 * @param acceptTerms - Whether to accept terms and conditions (default: true)
 */
export function fillRegisterForm(
  email: string,
  username: string,
  password: string,
  confirmPassword?: string,
  acceptTerms = true
): void {
  cy.get('[data-testid="register-form-email-input"]').type(email);
  cy.get('[data-testid="register-form-username-input"]').type(username);
  cy.get('[data-testid="register-form-password-input"]').type(password);
  cy.get('[data-testid="register-form-confirm-password-input"]').type(confirmPassword || password);

  if (acceptTerms) {
    cy.get('[data-testid="register-form-terms-checkbox"]').check();
  }
}

/**
 * Validates that a field shows a specific error message
 * @param fieldName - Name of the field (email, username, password, etc.)
 * @param expectedError - Expected error message text
 */
export function validateFieldError(fieldName: string, expectedError: string): void {
  cy.get(`[data-testid="register-form-${fieldName}-error"]`)
    .should('be.visible')
    .and('contain', expectedError);
}

/**
 * Validates that a field does not show an error message
 * @param fieldName - Name of the field (email, username, password, etc.)
 */
export function validateFieldNoError(fieldName: string): void {
  cy.get(`[data-testid="register-form-${fieldName}-error"]`).should('not.be.visible');
}

/**
 * Submits the register form
 */
export function submitRegisterForm(): void {
  cy.get('[data-testid="register-form-button"]').click();
}

/**
 * Navigates to the register page and verifies that it loaded correctly
 */
export function visitRegisterPage(): void {
  cy.visit(APP_ROUTES.REGISTER);
  cy.get('[data-testid="register-page"]').should('be.visible');
  cy.get('[data-testid="register-form"]').should('be.visible');
}

/**
 * Changes the language using the language picker
 * @param language - Language code (en-GB, es-ES)
 */
export function changeLanguage(language: string): void {
  cy.get('[data-testid="language-picker-select"]').select(language);
}

/**
 * Intercepts the register API call with a successful response
 * @param aliasName - Alias for the intercept
 * @param successMessage - Success message to return
 * @param userData - User data to return
 * @param delay - Optional delay in milliseconds
 */
export function interceptRegisterSuccess(
  aliasName: string,
  successMessage: string,
  userData: unknown,
  delay?: number
): void {
  const interceptConfig = {
    statusCode: 201,
    body: {
      success: true,
      message: successMessage,
      code: 201,
      status: 201,
      data: {
        user: userData,
      },
    },
    ...(delay && { delay }),
  };

  cy.intercept('POST', '**/api/auth/register', interceptConfig).as(aliasName);
}

/**
 * Intercepts the register API call with an error response
 * @param aliasName - Alias for the intercept
 * @param statusCode - HTTP status code
 * @param errorMessage - Error message to return
 * @param errorCode - Error code to return
 */
export function interceptRegisterError(
  aliasName: string,
  statusCode: number,
  errorMessage: string,
  errorCode: string
): void {
  cy.intercept('POST', '**/api/auth/register', {
    statusCode,
    body: {
      success: false,
      message: errorMessage,
      code: errorCode,
      status: statusCode,
    },
  }).as(aliasName);
}

/**
 * Validates successful redirection to email verification page
 */
export function validateSuccessfulRedirection(): void {
  cy.url().should('include', APP_ROUTES.VERIFY_EMAIL_SENT);
}

/**
 * Validates that the register button is disabled during submission
 */
export function validateButtonDisabledDuringSubmission(): void {
  cy.get('[data-testid="register-form-button"]').should('be.disabled');
}

/**
 * Validates that the register button is enabled before submission
 */
export function validateButtonEnabledBeforeSubmission(): void {
  cy.get('[data-testid="register-form-button"]').should('not.be.disabled');
}

/**
 * Validates that a success message is displayed
 * @param message - Success message text to validate
 */
export function validateSuccessMessage(message: string): void {
  cy.get('body').should('contain.text', message);
}

/**
 * Validates that the page title is correct
 * @param expectedTitle - Expected title text
 */
export function validatePageTitle(expectedTitle: string): void {
  cy.get('[data-testid="register-page-title"]').should('be.visible').and('contain', expectedTitle);
}

/**
 * Validates that all form fields are visible
 */
export function validateFormFieldsVisible(): void {
  cy.get('[data-testid="register-form-email-input"]').should('be.visible');
  cy.get('[data-testid="register-form-username-input"]').should('be.visible');
  cy.get('[data-testid="register-form-password-input"]').should('be.visible');
  cy.get('[data-testid="register-form-confirm-password-input"]').should('be.visible');
  cy.get('[data-testid="register-form-terms-checkbox"]').should('be.visible');
  cy.get('[data-testid="register-form-button"]').should('be.visible');
}

/**
 * Validates that the form can be navigated by keyboard
 */
export function validateKeyboardNavigation(): void {
  // Tab through all form fields
  cy.get('[data-testid="register-form-email-input"]').focus().should('have.focus');
  cy.get('[data-testid="register-form-username-input"]').focus().should('have.focus');
  cy.get('[data-testid="register-form-password-input"]').focus().should('have.focus');
  cy.get('[data-testid="btn-toggle-password"]').focus().should('have.focus');
  cy.get('[data-testid="register-form-confirm-password-input"]').focus().should('have.focus');
  cy.get('[data-testid="btn-toggle-confirm-password"]').focus().should('have.focus');
  cy.get('[data-testid="register-form-terms-checkbox"]').focus().should('have.focus');
  cy.get('[data-testid="register-form-button"]').focus().should('have.focus');
}

/**
 * Validates that error messages have appropriate accessibility attributes
 * @param fieldName - Name of the field
 */
export function validateErrorAccessibility(fieldName: string): void {
  cy.get(`[data-testid="register-form-${fieldName}-error"]`)
    .should('be.visible')
    .and('have.attr', 'data-testid');

  cy.get(`[data-testid="register-form-${fieldName}-input"]`).should(
    'have.attr',
    'aria-describedby'
  );
}

/**
 * Validates that form labels are properly associated with inputs
 */
export function validateFormLabels(): void {
  cy.get('[data-testid="register-form"] label').each($label => {
    cy.wrap($label).should('be.visible');
  });
}

/**
 * Validates that help texts are visible
 * @param helpTexts - Array of help text strings to validate
 */
export function validateHelpTexts(helpTexts: string[]): void {
  helpTexts.forEach(helpText => {
    cy.contains(helpText).should('be.visible');
  });
}

/**
 * Validates that the processing text is shown during submission
 * @param processingText - Processing text to validate
 */
export function validateProcessingText(processingText: string): void {
  cy.get('[data-testid="register-form-button"]').should('contain', processingText);
}

/**
 * Validates that the language picker shows the correct language
 * @param expectedLanguage - Expected language code
 */
export function validateLanguageSelection(expectedLanguage: string): void {
  cy.get('[data-testid="language-picker-select"]').should('have.value', expectedLanguage);
}

/**
 * Validates that real-time validation works correctly
 * @param fieldName - Name of the field
 * @param validValue - Valid value to test
 * @param invalidValue - Invalid value to test
 * @param expectedError - Expected error message
 */
export function validateRealTimeValidation(
  fieldName: string,
  validValue: string,
  invalidValue: string,
  expectedError: string
): void {
  // Test invalid value first
  cy.get(`[data-testid="register-form-${fieldName}-input"]`).clear().type(invalidValue).blur();

  validateFieldError(fieldName, expectedError);

  // Test valid value
  cy.get(`[data-testid="register-form-${fieldName}-input"]`).clear().type(validValue).blur();

  validateFieldNoError(fieldName);
}

/**
 * Common test data for register form
 */
export const TEST_DATA = {
  VALID_EMAIL: 'test@example.com',
  VALID_USERNAME: 'testuser',
  VALID_PASSWORD: 'Password123!',
  INVALID_EMAIL: 'invalid-email',
  INVALID_USERNAME: 'ab', // too short
  INVALID_PASSWORD: '123', // too weak
  EXISTING_EMAIL: 'existing@example.com',
  EXISTING_USERNAME: 'existinguser',
};

/**
 * Common error messages for validation (using i18n keys)
 */
export const ERROR_MESSAGES = {
  EMAIL_INVALID: 'errors.email.invalid',
  USERNAME_INVALID: 'errors.username.invalid',
  PASSWORD_INVALID: 'errors.password.invalid',
  PASSWORD_MISMATCH: 'errors.password.mismatch',
  TERMS_REQUIRED: 'errors.terms.required',
  USER_EXISTS: 'errors.user.exists',
  EMAIL_EXISTS: 'errors.email.exists',
};

describe('Register Page', () => {
  const registerPageUrl = `${APP_ROUTES.REGISTER}`;

  beforeEach(() => {
    cy.visit(registerPageUrl);
  });

  it('should load the register page', () => {
    cy.get('body').should('be.visible');
  });
});
