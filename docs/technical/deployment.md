# Deployment

## Deployment Target

- Platform: Vercel
- Trigger: GitHub Actions workflow `.github/workflows/deploy.yml`

## Branch Mapping

- `main`: triggers production deploy hook
- `uat`: triggers UAT deploy hook

Workflow behavior:

- Runs on push to `main` or `uat`
- Skips deploy trigger for one filtered commit-author email

## SPA Routing

`vercel.json` config:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

This rewrite is required so deep links in the SPA resolve to `index.html`.

## Release Checklist

1. Confirm target backend environment is available.
2. Confirm `VITE_MEDUSA_BACKEND_URL` for target environment.
3. Confirm `VITE_MEDUSA_STOREFRONT_URL` and `VITE_MEDUSA_BASE`.
4. Run validation:
   - `yarn lint`
   - `yarn test`
   - `yarn build`
5. Confirm deploy workflow/deploy hooks are active.

## Post-Deploy Smoke Test

1. Open admin root URL and verify app boot.
2. Verify login and authenticated navigation.
3. Verify one operation in each critical domain:
   - products
   - orders
   - sellers
   - attributes/requests
4. Verify deep-link refresh (non-root route) works due to rewrite.

## Rollback

If deployment is unhealthy:

1. Re-deploy previous stable Vercel build.
2. Verify environment variable values in Vercel.
3. Re-check backend compatibility for current admin version.
