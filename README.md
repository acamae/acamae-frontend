# @acamae/frontend

Modern React application for professional esports management.
Designed for accessibility, internationalization, and maintainability.

[![CI](https://github.com/acamae/acamae-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/acamae/acamae-frontend/actions/workflows/ci.yml) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=acamae_acamae-frontend&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=acamae_acamae-frontend) [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=acamae_acamae-frontend&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=acamae_acamae-frontend) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=acamae_acamae-frontend&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=acamae_acamae-frontend) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=acamae_acamae-frontend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=acamae_acamae-frontend) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=acamae_acamae-frontend&metric=coverage)](https://sonarcloud.io/summary/new_code?id=acamae_acamae-frontend) ![GitHub Release](https://img.shields.io/github/v/release/acamae/acamae-frontend) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/acamae/acamae-frontend/blob/main/LICENSE)

---

## Quick Start for New Developers

- **Branching & Release Strategy:**
  - `main`: Protected. All development is merged here via Pull Request (PR) after passing CI and review.
  - `release`: All versioning, tagging, and publishing is automated here. To create a release, merge `main` into `release`.
  - `feature/*`, `fix/*`: For new features and bugfixes. Open PRs to `main`.
- **CI/CD & Quality Gates:**
  - CI runs on all pushes and PRs to `main`, `feature/*`, and `fix/*` (see below for details).
  - Release workflow runs only on `release` branch and automates versioning, tagging, and publishing.
  - SonarCloud and Lighthouse are integrated for code quality and performance audits.
- **Environments & Secrets:**
  - Use the `development` environment for secrets like `SONAR_TOKEN`.
  - Jobs specify `environment: development` to access these secrets.
- **How to Release:**
  1. Develop and merge to `main` via PR.
  2. When ready to release, merge `main` into `release`.
  3. The `release` workflow will build, version, tag, and publish automatically.
- **Useful Commands:**
  - `npm run dev` – Start local dev server
  - `npm run lint` – Lint code
  - `npm run test` – Run unit tests
  - `npm run test:coverage` – Run tests with coverage
  - `npm run docker:up:dev` – Start with Docker (dev)
  - `npm run docker:up:prod` – Start with Docker (prod)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Documentation](#documentation)
- [Testing](#testing)
- [Docker & Deployment](#docker--deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The Acamae platform is a modern React application for professional esports management. Built with the latest technologies and best practices, it provides a secure, accessible, and maintainable foundation for esports teams and organizations.

**Perfect for**: Esports teams, tournament organizers, and gaming communities who need a professional management platform.

**Built with quality in mind**: 90%+ test coverage, accessibility compliance, and enterprise-grade security features.

---

## Tech Stack

**Frontend Core**

- **React 19** + **TypeScript** - Modern UI with type safety
- **Redux Toolkit** - Predictable state management
- **React Router v7** - Client-side routing
- **Bootstrap 5.3** - Responsive UI components

**Developer Experience**

- **Webpack 5** - Fast development and optimized builds
- **Jest + Testing Library** - Comprehensive unit testing
- **Cypress** - End-to-end testing
- **ESLint + Prettier** - Code quality and formatting

**Features**

- **i18next** - Multi-language support (Spanish/English)
- **Axios** - HTTP client with interceptors
- **Docker** - Containerized development and deployment
- **Redux Persist** - State persistence across sessions

---

## Quick Start

### For New Developers

1. **Clone and install**:

   ```bash
   git clone <repository-url>
   cd acamae-frontend
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Open browser**: Navigate to `http://localhost:3000`

That's it! The app includes:

- ✅ Hot reload for instant development
- ✅ Mock API responses for offline development
- ✅ Pre-configured testing environment
- ✅ Accessibility tools built-in

### Architecture Overview

The project follows **Clean/Hexagonal Architecture**:

```
src/
├── domain/          # Business logic and entities
├── application/     # Use cases and state management
├── infrastructure/  # External services (API, storage)
├── ui/             # React components and pages
└── shared/         # Common utilities and constants
```

**Why this structure?**

- **Easy to test** - Business logic is separate from UI
- **Easy to maintain** - Clear separation of concerns
- **Easy to understand** - Logical organization of code

---

## Project Structure

### File Organization

```
src/
├── domain/
│   ├── entities/          # User, Team (business objects)
│   ├── repositories/      # Interface definitions
│   └── services/         # Business logic
├── application/
│   ├── use-cases/        # Login, Register (user actions)
│   └── state/           # Redux slices and store
├── infrastructure/
│   ├── api/             # HTTP clients and API calls
│   └── storage/         # localStorage, sessionStorage
├── ui/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Full page components
│   ├── layouts/        # Page layout wrappers
│   └── hooks/          # Custom React hooks
└── shared/
    ├── constants/      # API routes, config values
    └── utils/         # Helper functions
```

### Naming Conventions

- **Components**: PascalCase (`LoginForm`, `UserProfile`)
- **Pages**: End with "Page" (`LoginPage`, `DashboardPage`)
- **Hooks**: Start with "use" (`useAuth`, `useForm`)
- **Files**: Match the main export (`LoginForm.tsx`)
- **Tests**: In `__tests__` folders (`LoginForm.test.tsx`)

---

## Development Workflow

### Prerequisites

- **Node.js 22+** (recommended: use nvm)
- **npm** (comes with Node.js)

### Development Commands

```bash
# Start development server (with hot reload)
npm run dev

# Run tests (with watch mode)
npm test

# Check code style
npm run lint

# Fix code style issues
npm run format

# Build for production
npm run build

# Start production build locally
npm run preview
```

### Code Quality

- **ESLint**: Catches common errors and enforces code style
- **Prettier**: Automatically formats code on save
- **TypeScript**: Provides type safety and better IDE support
- **Husky**: Runs checks before commits

**Pro tip**: Use VS Code with the recommended extensions for the best development experience!

---

## Key Features

### 🔐 Enterprise Security

- **Anti-DDoS protection** with intelligent throttling
- **JWT authentication** with automatic token refresh
- **Input validation** and sanitization
- **XSS/CSRF protection** built-in

### ♿ Accessibility First

- **WCAG 2.1 compliant** components
- **Keyboard navigation** support
- **Screen reader** friendly
- **Color contrast** validated

### 🌍 Internationalization

- **Multi-language support** (Spanish/English)
- **Dynamic language switching**
- **Date/time localization**
- **Right-to-left** language ready

### 🚀 Performance Optimized

- **Code splitting** for faster loads
- **Lazy loading** of routes and components
- **Optimized bundles** with Webpack 5
- **Progressive Web App** features

---

## Documentation

### For Developers

- **[API Specification](docs/api-specification.md)** - Complete API documentation
- **[User Authentication Flows](docs/user-flows.md)** - Login, registration, password reset
- **[Testing Guide](docs/testing-guide.md)** - Unit, integration, and E2E testing
- **[Security Features](docs/security-features.md)** - Security implementations and best practices

### For DevOps/Deployment

- **[OpenAPI Specification](docs/swagger.yml)** - Machine-readable API docs
- **[Conventional Commits](docs/conventional-versioning.md)** - Git workflow and versioning

### Quick References

- **API Endpoints**: All endpoints follow consistent response structure
- **Component Library**: Bootstrap 5.3 with custom theme
- **State Management**: Redux Toolkit with persist
- **Routing**: React Router v7 with lazy loading

---

## Testing

### Test Coverage

- **Minimum**: 90% coverage for all code
- **Current**: Check latest build status above
- **Reports**: Generated in `coverage/` folder

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test LoginForm

# Run E2E tests
npm run test:e2e

# Update snapshots (after review)
npm run update:snapshots
```

### Test Types

- **Unit Tests**: Individual components and functions
- **Integration Tests**: Component interactions and flows
- **E2E Tests**: Complete user journeys with Cypress
- **API Tests**: Backend integration testing

**Safety Note**: E2E tests use a completely separate test database with multiple security layers to prevent any production data issues.

---

## Docker & Deployment

### Local Development with Docker

The project uses Docker for consistent development environments across team members.

**Quick Start**:

```bash
# Create shared network (one-time setup)
npm run docker:create:net

# Start frontend container
npm run docker:up:dev

# Start backend container (in separate terminal)
cd ../acamae-backend
docker compose up -d
```

**Access the application**:

- **Frontend**: `https://localhost` (React app with hot reload)
- **Backend API**: `https://localhost/api` (API endpoints)

**Cleanup**:

```bash
npm run docker:down
```

### Available Docker Commands

| Command                     | Description                             |
| --------------------------- | --------------------------------------- |
| `npm run docker:create:net` | Create shared Docker network (one-time) |
| `npm run docker:up:dev`     | Start development environment           |
| `npm run docker:up:prod`    | Start production environment            |
| `npm run docker:down`       | Stop and cleanup containers             |
| `npm run docker:build:dev`  | Build development image                 |

### Production Deployment

The application is configured for deployment with:

- **Environment variables** for configuration
- **Health checks** for container monitoring
- **Multi-stage builds** for optimized images
- **Security scanning** for vulnerabilities

---

## Contributing

We welcome contributions! Here's how to get started:

### Development Process

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Run the test suite**: `npm test`
6. **Commit** using conventional commits: `feat: add amazing feature`
7. **Push** and create a **Pull Request**

### Pull Request Guidelines

- ✅ All tests must pass
- ✅ Code coverage must remain above 90%
- ✅ Follow existing code style (ESLint/Prettier)
- ✅ Update documentation if needed
- ✅ Add meaningful test cases
- ✅ Use conventional commit messages

### Getting Help

- **Documentation**: Check the `docs/` folder first
- **Issues**: Search existing issues before creating new ones
- **Questions**: Use GitHub Discussions for general questions
- **Security**: Email security issues privately

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**What this means**: You can use, modify, and distribute this code freely, including for commercial purposes. Just include the original license notice.
