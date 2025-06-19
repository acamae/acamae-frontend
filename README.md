# @acamae/frontend

Modern React application for professional esports management.
Designed for accessibility, internationalization, and maintainability.

![coverage](https://img.shields.io/badge/coverage-90%25-green) [![CI](https://github.com/acamae/acamae-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/acamae/acamae-frontend/actions/workflows/ci.yml) ![GitHub Release](https://img.shields.io/github/v/release/acamae/acamae-frontend) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=acamae_acamae-frontend&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=acamae_acamae-frontend) [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=acamae_acamae-frontend&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=acamae_acamae-frontend) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=acamae_acamae-frontend&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=acamae_acamae-frontend) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=acamae_acamae-frontend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=acamae_acamae-frontend) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=acamae_acamae-frontend&metric=coverage)](https://sonarcloud.io/summary/new_code?id=acamae_acamae-frontend) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/acamae/acamae-frontend/blob/main/LICENSE)

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
  - `npm run docker-start` – Start with Docker (dev)
  - `npm run docker-prod` – Start with Docker (prod)

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

### Quality Automation: GitHub Actions, Husky, and Pre-commit

#### GitHub Actions

- **CI (`ci.yml`)**: Runs on all pushes and PRs to `main`, `feature/*`, and `fix/*`. Validates code with linter (auto-fix and strict), build, unit tests, coverage, and SonarCloud analysis.
- **Release (`release.yml`)**: Runs only on `release` branch. Automates versioning, tagging, and publishing with Lerna using Conventional Commits. Only `release` branch is allowed for versioning/publishing.
- **Lighthouse (`lighthouse.yml`)**: Runs after CI on `main`. Audits performance, accessibility, and best practices. Uploads Lighthouse reports as artifacts and creates issues on regression.

#### Husky + lint-staged

- **Pre-commit**:
  - Skips automatically on Lerna versioning commits (detects commit messages that start with `chore(release):`).
  - Type checking with TypeScript (`tsc --noEmit`).
  - Runs unit tests only on staged files.
  - Linter and auto-formatting on staged files via lint-staged (ESLint and Prettier).
  - If any error remains after auto-fix, the commit is blocked.
- **Commit-msg**: Validates that all commit messages follow Conventional Commits using commitlint.

#### Other best practices

- `.gitattributes` and `.prettierrc` enforce LF line endings to avoid cross-platform issues.
- Workflows are separated for clarity and efficiency.
- Main branch protection: only PRs to `main`, no direct pushes, all checks must pass.

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

## SonarCloud & Code Quality

- **SonarCloud**: Static code analysis, code smells, coverage, and security.
  - Configured via `sonar-project.properties`.
  - Requires `SONAR_TOKEN` in the `development` environment.
  - Automatically runs in CI after tests and coverage.
- **Coverage**: Minimum 90% enforced. Reports generated with Jest and uploaded to SonarCloud.
- **Lighthouse**: Performance and accessibility audits after each CI on `main`.

---

## Further Reading

- [SonarCloud Documentation](https://sonarcloud.io/documentation)
- [Lerna Documentation](https://lerna.js.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

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

## 🛠️ Herramientas y Tecnologías

- **Frontend**: React, TypeScript, TailwindCSS
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions
- **Calidad de Código**: SonarCloud
- **Gestión de Paquetes**: NPM, Lerna
