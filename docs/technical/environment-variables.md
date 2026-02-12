# Environment Variables

## Source of Truth

- `.env.template`
- `vite.config.mts`
- `src/vite-env.d.ts`

## Required Variables

```env
VITE_MEDUSA_BASE=/
VITE_MEDUSA_STOREFRONT_URL=http://localhost:3000
VITE_MEDUSA_BACKEND_URL=http://localhost:9000
```

## Optional Variables

```env
VITE_MEDUSA_PROJECT=
VITE_MEDUSA_B2B_PANEL=false
VITE_TALK_JS_APP_ID=
```

Note: This project is currently documented to not use TalkJS. Keep `VITE_TALK_JS_APP_ID` unset unless the messaging feature is intentionally enabled again.

## Variable Reference

- `VITE_MEDUSA_BASE`: SPA base path (also used for invite URL generation)
- `VITE_MEDUSA_STOREFRONT_URL`: storefront URL used by admin links/integrations
- `VITE_MEDUSA_BACKEND_URL`: backend API base URL for SDK and custom requests
- `VITE_MEDUSA_PROJECT`: optional extension source project for admin-vite-plugin
- `VITE_MEDUSA_B2B_PANEL`: optional panel mode flag
- `VITE_TALK_JS_APP_ID`: optional messaging app ID (currently not part of active project usage)

## Build Injection Behavior

At build time, env values are mapped to globals:

- `VITE_MEDUSA_BASE` -> `__BASE__`
- `VITE_MEDUSA_BACKEND_URL` -> `__BACKEND_URL__`
- `VITE_MEDUSA_STOREFRONT_URL` -> `__STOREFRONT_URL__`
- `VITE_MEDUSA_B2B_PANEL` -> `__B2B_PANEL__`
- `VITE_TALK_JS_APP_ID` -> `__TALK_JS_APP_ID__`

Ensure these values are defined correctly in each deployment environment before build.
