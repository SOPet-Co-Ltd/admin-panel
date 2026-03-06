# Operations Runbook

## Local Setup

Install and run:

```bash
yarn install
cp .env.template .env.local
yarn dev
```

Default local URL: `http://localhost:9001`

## Daily Commands

```bash
yarn dev
yarn lint
yarn test
yarn format:check
yarn build
```

## Build and Quality Utilities

```bash
yarn i18n:validate
yarn i18n:schema
yarn generate:static
```

## Integration Validation

When modifying API-driven features:

1. Confirm `VITE_MEDUSA_BACKEND_URL` targets correct backend.
2. Verify auth flows and protected route behavior.
3. Validate one mutation and one read in changed domain.
4. Validate deep-link refresh behavior (SPA rewrite).

## Common Issues

### Admin cannot reach backend APIs

Cause:

- wrong `VITE_MEDUSA_BACKEND_URL`
- backend unavailable or CORS mismatch

Fix:

1. Verify backend URL value.
2. Check backend health and CORS policy.
3. Rebuild/restart app after env changes.

### Deep links return 404 on refresh

Cause:

- missing SPA rewrite in deployment layer.

Fix:

1. Ensure `vercel.json` rewrite is present.
2. Redeploy.

### UI text/translation regressions

Cause:

- invalid translation keys or schema drift.

Fix:

1. Run `yarn i18n:validate`.
2. Regenerate schema with `yarn i18n:schema` if needed.

## Change Management Checklist

1. Update docs for env/script/config changes.
2. Run `yarn lint`, `yarn test`, and `yarn build`.
3. Smoke test critical domains after deploy.
