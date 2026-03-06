# SOPet Admin Panel

Internal admin web app for SOPet ecommerce operations.

Built on Medusa Dashboard (Vite + React) with project-specific extensions and routes.

## What This App Covers

- Product and catalog operations
- Order and fulfillment operations
- Seller/vendor management
- Attribute, request, commission, campaign management
- Store configuration and marketplace administration

## Stack

- Vite `5`
- React `18`
- TypeScript
- Medusa admin dashboard packages (`@medusajs/*`)
- React Query + React Router

## Quick Start

1. Install dependencies:

```bash
yarn install
```

2. Create local env file:

```bash
cp .env.template .env.local
```

3. Configure `.env.local`:

```env
VITE_MEDUSA_BASE=/
VITE_MEDUSA_STOREFRONT_URL=http://localhost:3000
VITE_MEDUSA_BACKEND_URL=http://localhost:9000
```

4. Start admin app:

```bash
yarn dev
```

Default dev URL: `http://localhost:9001`

## Scripts

- `yarn dev`: start Vite dev server
- `yarn build`: build app package and generate types
- `yarn build:preview`: build preview bundle
- `yarn preview`: serve preview build
- `yarn test`: run vitest
- `yarn lint`: run eslint
- `yarn format`: format source files
- `yarn format:check`: check formatting
- `yarn i18n:validate`: validate translation files
- `yarn i18n:schema`: generate i18n schema

## Environment Variables

Primary env template: `.env.template`

Technical reference:

- `docs/technical/environment-variables.md`

## Deployment

Deployment is triggered by GitHub Actions workflow:

- `.github/workflows/deploy.yml`

Branch mapping:

- `main` -> Vercel production deploy hook
- `uat` -> Vercel UAT deploy hook

SPA rewrite is configured in `vercel.json`.

## Technical Documentation

- Docs index: `docs/technical/README.md`
- Architecture: `docs/technical/architecture.md`
- Env vars: `docs/technical/environment-variables.md`
- Deployment: `docs/technical/deployment.md`
- Operations: `docs/technical/operations.md`

## Repository Structure

```txt
src/dashboard-app/      Dashboard shell and route registration
src/routes/             Feature routes (orders, products, sellers, etc.)
src/hooks/api/          API hooks by domain
src/lib/                Client and shared utilities
src/providers/          App providers (theme, i18n, search, sidebar)
src/i18n/               Translation config and language files
scripts/                Build and i18n utility scripts
```
