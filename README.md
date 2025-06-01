# @emanager.com/frontend

Modern React application for professional esports management.
Designed for accessibility, internationalization, and maintainability.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style & Conventions](#code-style--conventions)
- [Testing & Quality](#testing--quality)
- [Docker & Deployment](#docker--deployment)
- [Environment Variables](#environment-variables)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This package contains the full-featured frontend for the Esports Management platform, built with React 19, TypeScript, and Redux Toolkit.
It follows Clean/Hexagonal Architecture and is optimized for accessibility (WCAG2), internationalization, and robust state management.

---

## Tech Stack

- React 19 + TypeScript
- Redux Toolkit (slice pattern, redux-persist)
- React Router v7
- Bootstrap 5.3
- i18next for internationalization
- Axios for HTTP requests
- Jest & Testing Library for unit tests
- Cypress for E2E tests
- Webpack 5
- Docker for local and production environments

---

## Architecture

- Hexagonal/Clean Architecture:
  - `domain/`, `application/`, `infrastructure/`, `ui/`, `shared/`
- State Management:
  - Modular Redux slices, persisted with redux-persist
- API Layer:
  - Centralized API route management, Axios clients
- Accessibility:
  - WCAG2 compliance, semantic HTML, keyboard navigation
- Internationalization:
  - i18next, dynamic language switching

---

## Project Structure

```
src/
  domain/
  application/
  infrastructure/
  ui/
    components/
    hooks/
    layouts/
    pages/
    routes/
  shared/
  i18n/
```

- Component Folders: PascalCase (`LoginForm/`, `UserProfile/`)
- Pages: Folders end with `Page` (`LoginPage/`)
- Layouts: Folders end with `Layout` (`MainLayout/`)

---

## Development Workflow

### Prerequisites

- Node.js 22+
- Yarn or npm

### Installation

```
npm install
```

### Running Locally

```
npm run dev
```

### Running with Docker

```
npm run docker-start
```

### Linting & Formatting

```
npm run lint
npm run format
```

### Testing

```
npm run test
npm run test:coverage
npm run update:snapshots
```

- Coverage: Minimum 90% for statements, branches, functions, and lines.
- Test location: `__tests__` subfolders next to components/pages.

---

## Code Style & Conventions

- Prettier: 2-space indent, single quotes, trailing commas, max 100 chars/line
- ESLint: Strict import order, no `any`, no unused variables
- Naming:
  - Components: PascalCase
  - Hooks: `use` + camelCase
  - Utilities: camelCase
  - Constants: UPPER_SNAKE_CASE
- Imports: Absolute with aliases (`@ui/components/Button`)
- Exports: Default for main components, named for hooks/utilities
- Tests: One responsibility per test, no `any`, no `require`
- API routes: Use constants from `shared/constants/apiRoutes.ts`, never hardcode URLs

---

## Testing & Quality

- Unit tests: Components, hooks, utilities
- Integration tests: Flows involving multiple components
- E2E tests: Cypress for user flows
- Test patterns:
  - Use `I18nextProvider` and `MemoryRouter` for integration
  - Mock only what is necessary
  - For route tests, mock layouts with `<Outlet />`
  - For page/component tests, mock hooks as needed
- Snapshots: Update only after review (`npm run update:snapshots`)
- Profiling: Use Jest and Node.js profiling for performance bottlenecks

---

## Docker & Deployment

- Dockerfile: Located in this package
- Docker Compose: Used for local development and production
- Nginx: Serves static files in production
- CI/CD: GitHub Actions for linting, testing, and deployment

### Running in Production

```
npm run docker-prod
```

---

## Environment Variables

| Variable                     | Description                          |
| ---------------------------- | ------------------------------------ |
| REACT_APP_LANG               | Default app language                 |
| REACT_APP_AUTH_TOKEN_KEY     | Auth token key name in localStorage  |
| REACT_APP_API_URL            | Backend API base URL                 |
| REACT_APP_ENABLE_ANALYTICS   | Enable/disable analytics             |
| REACT_APP_RECAPTCHA_SITE_KEY | Google reCAPTCHA public key          |
| ...                          | See `.env.development` for full list |

> Never include secrets or passwords in the frontend.

---

## API Integration

- All API endpoints are defined in `shared/constants/apiRoutes.ts`
- API responses follow a uniform structure: `{ success, data, message, code, status }`
- Always check the `success` field before processing data

---

## Contributing

- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- Use `npm run commit` for standardized commit messages
- See [Code Style & Conventions](#code-style--conventions) for details

---

## License

[MIT](LICENSE)
