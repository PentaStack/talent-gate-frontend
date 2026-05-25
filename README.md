# Talent Gate - Frontend

Vue 3 frontend for the **Talent Gate** job board application. This includes modules for the admin dashboard, employer analytics, payments, notifications, and user profiles.

## How to Run the Application (Backend & Frontend)

This application consists of a Laravel backend and a Vue 3 frontend. To run the full application locally, you need to start both servers concurrently.

### 1. Backend Setup (Laravel)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd ../backend
   ```
2. Install PHP dependencies via Composer:
   ```bash
   composer install
   ```
3. Create a copy of the environment file:
   ```bash
   cp .env.example .env
   ```
4. Generate the Laravel application key:
   ```bash
   php artisan key:generate
   ```
5. Run database migrations and seeders to initialize the database with sample data:
   ```bash
   php artisan migrate --seed
   ```
6. Start the local development server:
   ```bash
   php artisan serve
   ```
   The backend API will be available at `http://localhost:8000`.

### 2. Frontend Setup (Vue 3)

1. Open a **new terminal** and navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Create a copy of the environment file:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will be available at `http://localhost:5173`. It is configured to automatically proxy `/api` requests to the local backend server (`http://localhost:8000`).
   
   *Tip: You can set `VITE_USE_MOCKS=true` in your `.env` for offline UI mocks if the backend is not running.*

### 3. Sign In

Once both servers are running, open `http://localhost:5173` in your browser. You can sign in using seeded test accounts, such as:
- **Admin**: `admin@talentgate.test` / `password`

## Dev 5 Routes

| Route | Role |
|-------|------|
| `/admin/dashboard` | admin |
| `/admin/users` | admin |
| `/employer/analytics` | employer |
| `/payments/checkout?applicationId=501` | employer |
| `/payments/history` | employer |

API contract for backend: [docs/dev5-api-contract.md](docs/dev5-api-contract.md)

## Scripts

- `npm run dev` — starts the development server
- `npm run build` — performs typecheck and creates a production build
- `npm run typecheck` — runs TypeScript type checking

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur).
