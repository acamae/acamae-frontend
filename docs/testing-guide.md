# Testing Guide

## Overview

This guide explains how to test the Acamae platform. We use multiple types of tests to ensure code quality and prevent bugs from reaching production.

**Target Audience**: New developers, QA engineers, and anyone contributing to the codebase.

## Table of Contents

- [Types of Tests](#types-of-tests)
- [Running Tests](#running-tests)
- [Writing Unit Tests](#writing-unit-tests)
- [Writing Integration Tests](#writing-integration-tests)
- [End-to-End Testing](#end-to-end-testing)
- [Testing Best Practices](#testing-best-practices)
- [Troubleshooting](#troubleshooting)

---

## Types of Tests

### 1. Unit Tests

**What**: Test individual functions, hooks, and components in isolation
**Tool**: Jest + Testing Library
**Location**: `__tests__` folders next to components
**Speed**: Fast (milliseconds)

### 2. Integration Tests

**What**: Test how multiple components work together
**Tool**: Jest + Testing Library
**Location**: `__tests__` folders
**Speed**: Medium (seconds)

### 3. End-to-End Tests

**What**: Test complete user workflows in a real browser
**Tool**: Cypress
**Location**: `cypress/e2e/`
**Speed**: Slow (minutes)

### 4. API Tests

**What**: Test API endpoints and data flows
**Tool**: Jest + Supertest
**Location**: API test files
**Speed**: Medium (seconds)

---

## Running Tests

### Quick Commands

```bash
# Run all unit tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (re-runs when files change)
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Update test snapshots
npm run update:snapshots
```

### Running Specific Tests

```bash
# Run tests for a specific component
npm test -- LoginForm

# Run tests matching a pattern
npm test -- --testNamePattern="should handle login"

# Run tests in a specific directory
npm test -- src/ui/components/Forms
```

### Coverage Requirements

- **Minimum coverage**: 90% for statements, branches, functions, and lines
- **Coverage reports**: Generated in `coverage/` folder
- **View coverage**: Open `coverage/lcov-report/index.html` in browser

---

## Writing Unit Tests

### Basic Structure

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentToTest } from './ComponentToTest';

describe('ComponentToTest', () => {
  test('should render correctly', () => {
    render(<ComponentToTest />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  test('should handle user interaction', () => {
    const mockCallback = jest.fn();
    render(<ComponentToTest onAction={mockCallback} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockCallback).toHaveBeenCalled();
  });
});
```

### Testing Components with Context

```javascript
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from '@/store';

function renderWithProviders(component) {
  return render(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>
  );
}

test('should work with Redux and Router', () => {
  renderWithProviders(<MyComponent />);
  // Your test assertions
});
```

### Testing API Calls

```javascript
import axios from 'axios';
import { authRepository } from '@/infrastructure/api/AuthApiRepository';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthApiRepository', () => {
  beforeEach(() => {
    mockedAxios.post.mockClear();
  });

  test('should handle successful login', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: { user: { id: '1', email: 'test@example.com' } },
        status: 200,
        code: 'SUCCESS',
        message: 'Login successful',
        timestamp: '2024-01-15T10:30:00.000Z',
        requestId: 'test-id'
      }
    };

    mockedAxios.post.mockResolvedValue(mockResponse);

    const result = await authRepository.login('test@example.com', 'password');

    expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password'
    });
    expect(result.success).toBe(true);
    expect(result.data.user.email).toBe('test@example.com');
  });
});
```

---

## Writing Integration Tests

### Testing Complete Flows

```javascript
describe('Login Flow', () => {
  test('should complete login process', async () => {
    // Mock API response
    mockSuccessfulLogin();

    render(<LoginPage />);

    // Fill form
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    // Verify redirect
    expect(await screen.findByText('Welcome to Dashboard')).toBeInTheDocument();
  });
});
```

### Testing Error Handling

```javascript
test('should show error message on login failure', async () => {
  // Mock API error
  mockLoginError({
    status: 401,
    code: 'AUTH_INVALID_CREDENTIALS',
    message: 'Invalid credentials',
  });

  render(<LoginPage />);

  await userEvent.type(screen.getByLabelText('Email'), 'wrong@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
  await userEvent.click(screen.getByRole('button', { name: 'Login' }));

  expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
});
```

---

## End-to-End Testing

### Basic E2E Test Structure

```javascript
describe('User Registration', () => {
  beforeEach(() => {
    // Set up test database
    cy.task('db:reset');
  });

  it('should register a new user successfully', () => {
    cy.visit('/register');

    cy.get('[data-testid="email"]').type('newuser@example.com');
    cy.get('[data-testid="username"]').type('newuser');
    cy.get('[data-testid="password"]').type('SecurePassword123!');

    cy.get('[data-testid="submit-button"]').click();

    cy.url().should('include', '/verification-sent');
    cy.contains('Check your email').should('be.visible');
  });

  it('should show validation errors for invalid data', () => {
    cy.visit('/register');

    cy.get('[data-testid="email"]').type('invalid-email');
    cy.get('[data-testid="submit-button"]').click();

    cy.contains('Invalid email format').should('be.visible');
  });
});
```

### Testing Authentication

```javascript
describe('Protected Routes', () => {
  it('should redirect to login when not authenticated', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('should access dashboard when authenticated', () => {
    // Login first
    cy.login('user@example.com', 'password123');

    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');
  });
});
```

### Custom Cypress Commands

```javascript
// cypress/support/commands.ts
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password }
  }).then((response) => {
    window.localStorage.setItem('authToken', response.body.data.accessToken);
  });
});
```

### Database Safety

**CRITICAL**: E2E tests use a separate test database with multiple safety layers:

1. **Environment checks**: Only runs in `NODE_ENV=test`
2. **Database name validation**: Must contain "test"
3. **User validation**: Test users only
4. **Host protection**: Production hosts are blocked
5. **Port validation**: Remote ports are blocked

```bash
# Safe test database commands
npm run test:e2e:setup      # Set up test database
npm run test:e2e:cleanup    # Clean test database
npm run test:e2e:reset      # Reset test database
npm run test:e2e:verify     # Verify safe configuration
```

---

## Testing Best Practices

### DO ✅

1. **Write descriptive test names**

   ```javascript
   // Good
   test('should show validation error when email is invalid');

   // Bad
   test('email test');
   ```

2. **Test behavior, not implementation**

   ```javascript
   // Good - tests what user sees
   expect(screen.getByText('Login successful')).toBeInTheDocument();

   // Bad - tests internal state
   expect(component.state.isLoggedIn).toBe(true);
   ```

3. **Mock external dependencies**

   ```javascript
   // Mock API calls, timers, external services
   jest.mock('axios');
   jest.useFakeTimers();
   ```

4. **Clean up after tests**

   ```javascript
   afterEach(() => {
     jest.clearAllMocks();
     jest.restoreAllMocks();
   });
   ```

5. **Use data-testid for reliable selectors**

   ```javascript
   // In component
   <button data-testid="submit-button">Submit</button>;

   // In test
   cy.get('[data-testid="submit-button"]').click();
   ```

### DON'T ❌

1. **Don't test implementation details**
2. **Don't use `any` type in tests**
3. **Don't test third-party libraries**
4. **Don't write tests that depend on other tests**
5. **Don't use real API calls in unit tests**

### Test Organization

```
src/
  ui/
    components/
      LoginForm/
        __tests__/
          LoginForm.test.tsx        # Unit tests
          LoginForm.integration.test.tsx  # Integration tests
        LoginForm.tsx
```

---

## Troubleshooting

### Common Issues

#### Tests are slow

```bash
# Run tests in parallel
npm test -- --maxWorkers=4

# Run only changed files
npm test -- --onlyChanged
```

#### Mock not working

```javascript
// Make sure mock is before imports
jest.mock('./module');
import { Component } from './Component';

// Use manual mocks for complex scenarios
// __mocks__/module.ts
export const mockFunction = jest.fn();
```

#### Async tests failing

```javascript
// Use async/await
test('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe('expected');
});

// Use waitFor for DOM updates
await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

#### Coverage not accurate

```bash
# Clear cache and run again
npx jest --clearCache
npm run test:coverage
```

### Getting Help

1. **Check existing tests**: Look at similar components for patterns
2. **Read error messages**: Jest provides helpful error descriptions
3. **Use debugger**: Add `console.log` or `screen.debug()` in tests
4. **Check documentation**:
   - [Testing Library docs](https://testing-library.com/)
   - [Jest docs](https://jestjs.io/)
   - [Cypress docs](https://docs.cypress.io/)

---

## Testing Checklist

Before submitting code, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Coverage is above 90% (`npm run test:coverage`)
- [ ] No console errors or warnings
- [ ] Tests are descriptive and meaningful
- [ ] Edge cases are covered
- [ ] Error scenarios are tested
- [ ] API responses follow standard structure
- [ ] Accessibility is tested (if applicable)

**Remember**: Good tests save time and prevent bugs. Invest in testing, and your future self will thank you!
