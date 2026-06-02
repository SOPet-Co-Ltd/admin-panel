# SOPet Admin Panel

Internal admin web app for SOPet ecommerce operations.

Built on Medusa Dashboard `2.10.3` (Vite + React) with project-specific extensions and routes.

## What This App Covers

- Product and catalog operations
- Order and fulfillment operations
- Seller/vendor management
- Attribute, request, commission, and campaign management
- Store configuration and marketplace administration
- Inventory, regions, tax regions, and user management

## Stack

- Vite `5`
- React `18`
- TypeScript `5.2`
- Medusa admin dashboard packages (`@medusajs/*` `2.10.3`)
- TanStack Query `5` + React Router `6`
- Tailwind CSS `3`
- Zod `3` + React Hook Form `7`

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
# Required
VITE_MEDUSA_BASE=/
VITE_MEDUSA_STOREFRONT_URL=http://localhost:3000
VITE_MEDUSA_BACKEND_URL=http://localhost:9000

# Optional
VITE_MEDUSA_PROJECT=
VITE_MEDUSA_B2B_PANEL=false
VITE_TALK_JS_APP_ID=
```

4. Start admin app:

```bash
yarn dev
```

Default dev URL: `http://localhost:9001`

## Scripts

- `yarn dev`: start Vite dev server
- `yarn build`: build app package and generate types
- `yarn build:preview`: build Vite preview bundle
- `yarn preview`: serve preview build
- `yarn test`: run vitest
- `yarn lint`: run ESLint
- `yarn format`: format source files with Prettier
- `yarn format:check`: check formatting
- `yarn i18n:validate`: validate translation files
- `yarn i18n:schema`: generate i18n schema
- `yarn generate:static`: regenerate currency list

## Environment Variables

| Variable                     | Required | Description                                    |
| ---------------------------- | -------- | ---------------------------------------------- |
| `VITE_MEDUSA_BASE`           | yes      | SPA base path                                  |
| `VITE_MEDUSA_BACKEND_URL`    | yes      | Backend API base URL                           |
| `VITE_MEDUSA_STOREFRONT_URL` | yes      | Storefront URL for admin links                 |
| `VITE_MEDUSA_PROJECT`        | no       | Extension source project for admin-vite-plugin |
| `VITE_MEDUSA_B2B_PANEL`      | no       | Enable B2B panel mode (`false` by default)     |
| `VITE_TALK_JS_APP_ID`        | no       | TalkJS messaging app ID (not in active use)    |

Full reference: `docs/technical/environment-variables.md`

## Deployment

Triggered by GitHub Actions: `.github/workflows/deploy.yml`

| Branch        | Target             |
| ------------- | ------------------ |
| `main`        | Vercel production  |
| `uat`         | Vercel UAT         |
| `development` | Vercel development |

SPA deep-link routing is handled by the rewrite rule in `vercel.json`.

### Release Checklist

1. Confirm backend environment is available and `VITE_MEDUSA_BACKEND_URL` is correct
2. Run `yarn lint && yarn test && yarn build`
3. Confirm deploy hooks are active in GitHub Actions

Full deployment guide: `docs/technical/deployment.md`

## Architecture

Single-page application (SPA). Boot sequence:

1. `src/main.tsx` mounts the app root
2. `src/app.tsx` initializes `DashboardApp` and plugin modules
3. Routes and widgets load from `virtual:medusa/*`
4. Features render from `src/routes/**`
5. API calls go through `src/hooks/api/**` and `src/lib/client/**`

The app supports Medusa extension modules (routes, widgets, display, form, menu items) via virtual module imports at runtime.

Full architecture doc: `docs/technical/architecture.md`

## Repository Structure

```txt
src/dashboard-app/      Dashboard shell and route registration
src/routes/             Feature routes (orders, products, sellers, attributes,
                        commission, campaigns, inventory, regions, tax-regions, users)
src/hooks/api/          Typed API hooks by backend domain
src/lib/                SDK client, URL config, formatting helpers
src/providers/          App-level providers (theme, i18n, keybinds, search, sidebar)
src/components/         Shared UI components
src/types/              Custom domain and mutation types
src/i18n/               Translation config and language files
scripts/                Build and i18n utility scripts
docs/technical/         Architecture, env vars, deployment, and operations docs
```

## Technical Documentation

- `docs/technical/README.md` — docs index
- `docs/technical/architecture.md` — app architecture and extension system
- `docs/technical/environment-variables.md` — env variable reference
- `docs/technical/deployment.md` — Vercel deployment workflow and release checklist
- `docs/technical/operations.md` — local runbook, validation, troubleshooting
