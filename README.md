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
npm run docker:up:dev
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

- **CI (`ci.yml`)**: Runs linting, build, tests, coverage, and SonarCloud on every push/PR to `main`, `feature/*`, or `fix/*`.
- **Release (`release.yml`)**: Runs only on `release`. Automates versioning, tagging, and publishing with Lerna.
- **Lighthouse (`lighthouse.yml`)**: After CI on `main`, performs Lighthouse audits and uploads reports as artifacts.

---

## Docker & Deployment

🆕 **New local architecture (2025-06-21)**

To prevent port collisions and simplify local development, **the backend's Nginx container is now the single TLS termination point**. The frontend container only runs `webpack-dev-server` and is exposed on the internal Docker network.

### Step 1 — Create the external network (one-time)

```bash
npm run docker:create:net   # or:  docker network create --driver bridge acamae-network
```

### Step 2 — Start the containers

```bash
# Frontend
npm run docker:up:dev

# Backend
cd ../acamae-backend
docker compose -f docker/docker-compose.yml up -d
```

You can now access:

- `https://localhost` — React SPA with HMR
- `https://localhost/api` — Backend API

### Step 3 — Shut everything down

```bash
npm run docker:down
cd ../acamae-backend && docker compose down -v --remove-orphans
```

### Key notes

- **No Nginx in frontend**: `docker/docker-compose.yml` of the frontend no longer contains an Nginx service nor publishes 80/443.
- **Shared network**: both stacks declare `acamae-network` as `external: true`.
- **Nginx config**: includes `resolver 127.0.0.11 valid=30s;` and proxies to `frontend:3000`.
- **Port/service changes**: if you rename the service or change the internal port, update the `proxy_pass` rule accordingly.

### Quick commands

| Command                     | Description                                |
| --------------------------- | ------------------------------------------ |
| `npm run docker:create:net` | Create the `acamae-network` (run once)     |
| `npm run docker:build:dev`  | Build the dev image of the frontend        |
| `npm run docker:up:dev`     | Start the frontend container in dev mode   |
| `npm run docker:up:prod`    | Start the production stack of the frontend |
| `npm run docker:down`       | Stop the frontend and clean volumes        |

---

## Environment Variables

- `SONAR_TOKEN`: Used for SonarCloud integration

---

## API Integration

- Centralized API route management, Axios clients

---

## Contributing

- Fork the repository
- Create a new branch
- Make your changes
- Commit and push your changes
- Create a pull request

---

## License

This project is licensed under the MIT License.
