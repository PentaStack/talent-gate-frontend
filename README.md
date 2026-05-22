# talent-gate-frontend

Vue 3 frontend for **Talent Gate** job board. Dev 5 module: admin dashboard, employer analytics, payments, and notifications.

## Quick start (with backend)

1. Start API: see `../talent-gate-backend` — `php artisan migrate && php artisan db:seed && php artisan serve`
2. Frontend:

```sh
cp .env.example .env
npm install
npm run dev
```

3. Open http://localhost:5173 — sign in with `admin@talentgate.test` / `password` (or employer/candidate).

`npm run dev` proxies `/api` to `http://localhost:8000`. Set `VITE_USE_MOCKS=true` for offline UI mocks.

## Dev 5 routes

| Route | Role |
|-------|------|
| `/admin/dashboard` | admin |
| `/admin/users` | admin |
| `/employer/analytics` | employer |
| `/payments/checkout?applicationId=501` | employer |
| `/payments/history` | employer |

API contract for backend: [docs/dev5-api-contract.md](docs/dev5-api-contract.md)

## Scripts

- `npm run dev` — development server
- `npm run build` — typecheck + production build
- `npm run typecheck` — TypeScript only

---

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
