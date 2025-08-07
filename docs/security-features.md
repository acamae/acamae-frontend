# Security Features

## Overview

The Acamae platform implements multiple security layers to protect against common web application vulnerabilities and attacks. This guide explains the security features available and how to use them effectively.

**Target Audience**: New developers, security-conscious developers, and anyone implementing forms or authentication features.

## Table of Contents

- [Anti-DDoS Protection (Throttling)](#anti-ddos-protection-throttling)
- [Authentication Security](#authentication-security)
- [Input Validation & Sanitization](#input-validation--sanitization)
- [XSS & CSRF Protection](#xss--csrf-protection)
- [Security Testing](#security-testing)
- [Configuration](#configuration)
- [Best Practices](#best-practices)

---

## Anti-DDoS Protection (Throttling)

### What It Does

The throttling system prevents spam and DDoS attacks by limiting how often users can submit forms. It's like a "cool-down" period that prevents rapid-fire submissions.

### How It Works

1. **User submits form** → Timer starts
2. **Button shows countdown** → "Submit (3s)"
3. **Timer expires** → Button becomes available again
4. **Too many attempts** → Temporary block with warning

### Throttling Levels

#### Authentication Forms (Strictest)

- **Delay**: 4 seconds between submissions
- **Max attempts**: 8 attempts per 5 minutes
- **Persistence**: Survives page refresh
- **Forms**: Login, Register, Password Reset, Email Verification

#### Regular Forms (Balanced)

- **Delay**: 3 seconds between submissions
- **Max attempts**: 12 attempts per 5 minutes
- **Persistence**: No (resets on page refresh)
- **Forms**: General contact forms, feedback forms

#### Critical Actions (Most Strict)

- **Delay**: 5 seconds between submissions
- **Max attempts**: 5 attempts per 5 minutes
- **Persistence**: Yes (survives page refresh)
- **Forms**: Account deletion, sensitive settings

### Implementation Example

```typescript
import { useAuthThrottledSubmit } from '@/hooks/useAuthThrottledSubmit';

function LoginForm() {
  const {
    isThrottled,
    canSubmit,
    timeUntilNextSubmission,
    remainingAttempts,
    handleThrottledSubmit,
  } = useAuthThrottledSubmit('login-form');

  const handleSubmit = async (formData) => {
    if (!canSubmit) return;

    await handleThrottledSubmit(async () => {
      // Your form submission logic
      await authRepository.login(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}

      <button
        type="submit"
        disabled={!canSubmit}
        className={isThrottled ? 'btn-throttled' : 'btn-normal'}
      >
        {isThrottled
          ? `Submit (${timeUntilNextSubmission}s)`
          : 'Submit'
        }
      </button>

      {remainingAttempts <= 2 && (
        <div className="alert alert-warning">
          Warning: {remainingAttempts} attempts remaining
        </div>
      )}
    </form>
  );
}
```

### User Experience

1. **Normal state**: Button works immediately
2. **Throttled state**: Button shows countdown
3. **Warning state**: Alert when ≤2 attempts remain
4. **Blocked state**: Button disabled temporarily

### Development Tools

```typescript
// Clear all throttling (development only)
SecurityThrottleService.clearPersistedStates();

// Check current throttling status
const status = SecurityThrottleService.getThrottleState('form-name');
console.log(status);

// Reset specific form throttling
SecurityThrottleService.resetThrottle('login-form');
```

---

## Authentication Security

### JWT Token System

#### Access Tokens

- **Lifetime**: 1 day
- **Storage**: Redux store (memory)
- **Purpose**: API authentication
- **Auto-refresh**: Yes, when expired

#### Refresh Tokens

- **Lifetime**: 7 days
- **Storage**: HTTP-only cookies (secure)
- **Purpose**: Renew access tokens
- **Rotation**: Yes, on each use

### Session Management

```typescript
import { useAuth } from '@/hooks/useAuth';

function ProtectedComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Automatic logout when token expires
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      // User was logged out (token expired or invalid)
      router.push('/login');
    }
  }, [isAuthenticated, isLoading]);

  return (
    <div>
      <h1>Welcome, {user?.username}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Role-Based Access Control (RBAC)

```typescript
import { PrivateRoute } from '@/components/PrivateRoute';

// Protect entire routes
<PrivateRoute roles={['admin', 'manager']}>
  <AdminPanel />
</PrivateRoute>

// Check roles in components
function SensitiveAction() {
  const { hasRole } = useAuth();

  if (!hasRole('admin')) {
    return <div>Access denied</div>;
  }

  return <AdminControls />;
}
```

---

## Input Validation & Sanitization

### Form Validation with Zod

```typescript
import { z } from 'zod';

const userRegistrationSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .transform(email => email.toLowerCase().trim()),

  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    ),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
});

// Use in forms
function RegisterForm() {
  const { values, errors, handleSubmit } = useForm({
    schema: userRegistrationSchema,
    onSubmit: async data => {
      // data is automatically validated and sanitized
      await authRepository.register(data);
    },
  });
}
```

### Automatic Sanitization

```typescript
import { sanitizeInput } from '@/utils/sanitization';

// Automatically applied to all form inputs
const sanitizedData = {
  email: sanitizeEmail(formData.email), // Lowercase, trim
  username: sanitizeUsername(formData.username), // Remove special chars
  message: sanitizeHtml(formData.message), // Remove dangerous HTML
};
```

---

## XSS & CSRF Protection

### XSS Prevention

1. **React built-in protection**: Automatic escaping of dynamic content
2. **Content Security Policy**: Configured headers block inline scripts
3. **Input sanitization**: Remove dangerous HTML tags
4. **Output encoding**: Escape special characters

```typescript
// Safe by default in React
function UserProfile({ user }) {
  return (
    <div>
      {/* This is automatically escaped */}
      <h1>Welcome, {user.name}</h1>

      {/* For HTML content, use sanitization */}
      <div dangerouslySetInnerHTML={{
        __html: sanitizeHtml(user.bio)
      }} />
    </div>
  );
}
```

### CSRF Protection

1. **JWT in headers**: Tokens sent in Authorization header (not cookies)
2. **SameSite cookies**: Prevent cross-site cookie sending
3. **Origin validation**: Server checks request origin
4. **Short-lived tokens**: Reduce attack window

```typescript
// Axios automatically includes JWT token
const response = await axios.post('/api/sensitive-action', data, {
  headers: {
    Authorization: `Bearer ${token}`,
    'X-Requested-With': 'XMLHttpRequest',
  },
});
```

---

## Security Testing

### Automated Security Tests

```javascript
describe('Security Features', () => {
  test('should prevent XSS attacks', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeHtml(maliciousInput);
    expect(sanitized).not.toContain('<script>');
  });

  test('should enforce rate limiting', async () => {
    const form = render(<LoginForm />);

    // First submission should work
    await submitForm(form);

    // Immediate second submission should be throttled
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  test('should validate dangerous inputs', () => {
    const schema = userRegistrationSchema;

    expect(() =>
      schema.parse({
        email: 'not-an-email',
        username: 'a', // too short
        password: '123', // too weak
      })
    ).toThrow();
  });
});
```

### Manual Security Testing

1. **Try SQL injection**: Input `'; DROP TABLE users; --` in forms
2. **Test XSS**: Input `<script>alert('xss')</script>` in text fields
3. **Check CSRF**: Try making requests from external sites
4. **Rate limiting**: Submit forms rapidly
5. **Token manipulation**: Modify JWT tokens

---

## Configuration

### Environment Variables

```bash
# Throttling configuration
REACT_THROTTLE_DELAY_MS=4000           # 4 seconds between submissions
REACT_THROTTLE_MAX_ATTEMPTS=8         # Max attempts per window
REACT_THROTTLE_WINDOW_MS=300000       # 5 minutes window

# Security features
REACT_APP_ENABLE_CSP=true              # Content Security Policy
REACT_APP_SECURE_COOKIES=true          # Secure cookie settings
REACT_APP_SESSION_TIMEOUT=86400000     # 24 hours
```

### Production Security Headers

```javascript
// Configured on backend
{
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
}
```

---

## Best Practices

### DO ✅

1. **Always validate input** on both client and server
2. **Use parameterized queries** to prevent SQL injection
3. **Implement proper authentication** with JWT tokens
4. **Enable throttling** on all forms
5. **Sanitize user content** before displaying
6. **Use HTTPS** in production
7. **Keep dependencies updated** for security patches
8. **Log security events** for monitoring

### DON'T ❌

1. **Don't trust client-side validation** alone
2. **Don't store sensitive data** in localStorage
3. **Don't use `eval()` or `innerHTML`** with user content
4. **Don't hardcode secrets** in frontend code
5. **Don't ignore security warnings** from tools
6. **Don't disable security features** without understanding implications

### Security Checklist

Before deploying:

- [ ] All forms have input validation
- [ ] Sensitive forms use throttling
- [ ] Authentication is properly implemented
- [ ] User inputs are sanitized
- [ ] Security headers are configured
- [ ] HTTPS is enabled
- [ ] Dependencies are updated
- [ ] Security tests are passing
- [ ] Error messages don't leak sensitive information
- [ ] Logging captures security events

### Common Vulnerabilities to Avoid

1. **Cross-Site Scripting (XSS)**
   - Always escape user content
   - Use Content Security Policy
   - Validate and sanitize inputs

2. **Cross-Site Request Forgery (CSRF)**
   - Use JWT tokens in headers
   - Validate request origins
   - Implement SameSite cookies

3. **SQL Injection**
   - Use parameterized queries
   - Validate all inputs
   - Apply principle of least privilege

4. **Brute Force Attacks**
   - Implement rate limiting
   - Use strong password policies
   - Monitor failed login attempts

5. **Session Hijacking**
   - Use secure, HTTP-only cookies
   - Implement token rotation
   - Set proper session timeouts

---

## Getting Help

- **Security questions**: Check with the security team
- **Implementation help**: Look at existing secure components
- **Testing**: Run security tests regularly
- **Updates**: Monitor security advisories for dependencies

**Remember**: Security is everyone's responsibility. When in doubt, choose the more secure option!
