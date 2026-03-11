# Microsaas - Setup Guide

This README is the single source of truth to install and run the project.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Symfony 7 (PHP 8.2)
- Database: MariaDB 11
- Optional DB UI: Adminer

## Prerequisites

Choose one of these setups:

- Recommended: Docker Desktop (with Docker Compose)
- Local/manual:
  - Node.js 20+ and npm
  - PHP 8.2+
  - Composer 2+
  - MariaDB 11 (or run only DB with Docker)

## Quick Start (Recommended: Docker)

1. From project root, start everything:

```bash
docker compose up --build
```

2. In another terminal, run DB migrations:

```bash
docker compose exec api php bin/console doctrine:migrations:migrate --no-interaction
```

3. Open the apps:

- Frontend: http://localhost:5173
- API: http://localhost:8080
- Adminer: http://localhost:8081

Default DB credentials (from `compose.yml`):

- Server: `database`
- Database: `app`
- User: `app`
- Password: `app`
- Root password: `root`

## Local Setup (Without Full Docker)

If you prefer running app processes locally:

### 1. Start database

Option A (easiest): only DB in Docker

```bash
docker compose up -d database
```

Option B: use your own local MariaDB and update `DATABASE_URL`.

### 2. Backend (`api`)

```bash
cd api
composer install
```

Create `api/.env.local` (if missing) with at least:

```dotenv
DATABASE_URL="mysql://app:app@127.0.0.1:3306/app"
JWT_PASSPHRASE="change-me"
APP_SECRET="change-me-too"
```

Generate JWT keys (if missing):

```bash
php bin/console lexik:jwt:generate-keypair --skip-if-exists
```

Run migrations:

```bash
php bin/console doctrine:migrations:migrate --no-interaction
```

Start API (recommended with Symfony CLI):

```bash
symfony serve
```

If Symfony CLI is not installed, use:

```bash
php -S 0.0.0.0:8080 -t public
```

### 3. Frontend (`client`)

```bash
cd client
npm install
```

Create `client/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
```

Start frontend:

```bash
npm run dev
```

Frontend URL: http://localhost:5173

## Useful Commands

### Frontend (`client`)

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run test:run
```

### Backend (`api`)

```bash
php bin/console doctrine:migrations:migrate
composer lint
```

### Optional: import anime data

Requires API running on `http://localhost:8080`.

```bash
cd api
npm install
node scripts/importAnimes.js --start=1 --limit=10
```

## Reset / Rebuild

Full Docker rebuild:

```bash
docker compose down -v
docker compose up --build
```

Then rerun migrations.

## Troubleshooting

- Port already in use: free `5173`, `8080`, `8081`, `3306` or change mappings in `compose.yml`.
- API cannot connect DB: check `DATABASE_URL` host:
  - Docker: use `database`
  - Local API + local DB: use `127.0.0.1`
- Login/JWT errors: verify key files exist in `api/config/jwt/` and `JWT_PASSPHRASE` is correct.
