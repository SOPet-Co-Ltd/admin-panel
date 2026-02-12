# Admin Panel Architecture

## High-Level Overview

The admin panel is a Vite + React application built on Medusa Dashboard packages, with custom routes and domain modules for SOPet operations.

- Runtime: single-page application (SPA)
- Build tool: Vite
- UI framework: React + Medusa UI
- Data access: Medusa JS SDK + domain API hooks

## Runtime Model

1. `src/main.tsx` mounts the application root.
2. `src/app.tsx` initializes `DashboardApp` and plugin modules.
3. Route and widget modules are loaded from `virtual:medusa/*`.
4. Features render from `src/routes/**`.
5. API interactions are handled by `src/hooks/api/**` and `src/lib/client/**`.

## Build-Time Configuration

`vite.config.mts` injects environment values into compile-time constants:

- `__BASE__`
- `__BACKEND_URL__`
- `__STOREFRONT_URL__`
- `__B2B_PANEL__`
- `__TALK_JS_APP_ID__`

These constants are consumed in runtime files (for example `src/lib/client/client.ts`, `src/lib/storefront.ts`, and route features).

## Route/Domain Layout

Route modules live under `src/routes` with a feature-first organization.

Current route area directories include:

- orders
- products
- sellers
- requests
- attributes
- commission
- campaigns
- store
- inventory
- users
- regions
- tax-regions

Scale snapshot:

- `579` route-related `.tsx` files under `src/routes`

## Core Layers

- `src/dashboard-app`: dashboard shell, route wiring, extension points
- `src/providers`: app-level providers (theme, i18n, keybinds, sidebar, search)
- `src/hooks/api`: typed data hooks by backend domain
- `src/lib`: SDK client, URL config, formatting/helpers
- `src/types`: custom domain and mutation typing

## Extension and Plugin Mechanism

The app supports Medusa extension modules at runtime using virtual module imports.

- route extensions
- widget extensions
- display extensions
- form extensions
- menu item extensions

This enables modular feature additions without restructuring core app bootstrapping.
