# Dev 5 API Contract (Frontend ↔ Backend)

Linked to `talent-gate-backend` Dev 5 routes. Auth uses **session cookies** (`withCredentials: true`), not Bearer tokens.

## Local setup

**Backend** (`talent-gate-backend`):

```sh
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed   # creates admin@ / employer@ / candidate@ talentgate.test (password: password)
php artisan serve
```

**Frontend** (`talent-gate-frontend`):

```sh
cp .env.example .env   # VITE_USE_MOCKS=false, VITE_API_BASE_URL=/api
npm run dev            # proxies /api → http://localhost:8000
```

## Auth

| Method | Path | Body |
|--------|------|------|
| POST | `/api/login` | `{ "email", "password" }` → `{ "user": { id, name, email, role } }` |
| POST | `/api/logout` | (authenticated) |
| GET | `/api/user` | (authenticated) |

## Admin stats

`GET /api/admin/stats` — **admin**

```json
{ "users": 3, "jobs": 4, "applications": 5 }
```

Frontend maps to `users_count`, `jobs_count`, `applications_count`. Charts only when mock mode or backend adds series data.

## Employer analytics

`GET /api/employer/analytics` — **employer**

```json
{
  "jobs": [{ "id": 1, "title": "...", "views": 120, "applications": 2 }]
}
```

Frontend maps `id` → `job_id` and computes `totals`.

## Payments

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/payments` | Employer list; `?application_id=` filter |
| POST | `/api/payments/paypal` | `{ "job_id", "amount" }` → `{ "payment_id", "approval_url" }` |
| POST | `/api/payments/stripe/webhook` | Public; Stripe signature header |

Stripe employer checkout: pending payment is **auto-created** when application status → `accepted`. No `/stripe/intent` on API.

### Dev 4 → checkout

```ts
router.push({ name: 'checkout', query: { applicationId: String(application.id) } })
```

Frontend loads `GET /api/payments?application_id={id}` for summary.

## Notifications

| Method | Path |
|--------|------|
| GET | `/api/notifications` |
| PATCH | `/api/notifications/{uuid}/read` |
| POST | `/api/notifications/read-all` |

Laravel shape:

```json
{
  "data": [{
    "id": "uuid",
    "type": "App\\Notifications\\...",
    "data": { "message": "...", "job_title": "..." },
    "read_at": null,
    "created_at": "..."
  }]
}
```

Mapped in `src/api/mappers/dev5.ts` to `{ title, body, read, type }`.

## Admin users

| Method | Path | Body |
|--------|------|------|
| GET | `/api/admin/users` | — |
| PATCH | `/api/admin/users/{id}/ban` | — |
| PATCH | `/api/admin/users/{id}` | `{ "role": "employer" }` |

```json
{
  "data": [{
    "id": 2,
    "name": "Employer Co",
    "email": "employer@talentgate.test",
    "role": "employer",
    "banned": false,
    "created_at": "2026-05-22T10:00:00.000000Z"
  }]
}
```

Rules: cannot ban yourself or other admins; cannot change your own role. Banned users cannot log in.

## Mock mode

Set `VITE_USE_MOCKS=true` to use in-memory fixtures without the API.
