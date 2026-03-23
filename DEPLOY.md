# Deploying LMS

This repo runs **one Node process**: Next.js + Express API (`apps/web/server.ts`). Use **Node 20+** and a **MySQL 8** database.

## Required environment variables

Set these in your host (Docker, Railway, Render, Fly.io, etc.):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string (Prisma), e.g. `mysql://user:pass@host:3306/lms` |
| `JWT_ACCESS_SECRET` | ≥16 characters |
| `JWT_REFRESH_SECRET` | ≥16 characters, different from access |
| `FRONTEND_ORIGIN` | Exact public URL of the app, e.g. `https://app.example.com` (used for CORS + cookies) |
| `NODE_ENV` | `production` |
| `PORT` | Usually `3000` (platforms often inject this) |
| `HOST` | `0.0.0.0` in containers (default in Docker image) |
| `REFRESH_COOKIE_SECURE` | `true` when serving over HTTPS |

Do **not** commit real secrets. Copy `apps/api/.env.production.example` as a checklist.

### Managed MySQL (Aiven, Railway, cloud SQL, etc.)

**Yes — you can deploy the app and use Aiven (or any MySQL 8–compatible host).**  
Set **`DATABASE_URL`** in your hosting provider’s env to the connection string Aiven gives you (usually includes SSL), for example:

```text
mysql://USER:PASSWORD@HOST:PORT/defaultdb?sslmode=require
```

- **Networking**: In Aiven → your service → **Networking**, allow the **public IP** of your app (or your PaaS egress IPs). Serverless platforms often use dynamic IPs — you may need **0.0.0.0/0** for testing (tighten for production if possible).
- **Migrations**: Run `prisma migrate deploy` on deploy (the Docker image does this at startup) so tables exist on Aiven before traffic hits the app.

Local dev can stay on Docker MySQL; production **`DATABASE_URL`** on the host only needs to point at Aiven.

## 1. Docker (recommended)

Build and run locally:

```bash
docker build -t lms .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="mysql://..." \
  -e JWT_ACCESS_SECRET="..." \
  -e JWT_REFRESH_SECRET="..." \
  -e FRONTEND_ORIGIN="https://your-domain.com" \
  -e NODE_ENV=production \
  -e REFRESH_COOKIE_SECURE=true \
  lms
```

The container runs `prisma migrate deploy` on startup, then starts the app.

## 2. Docker Compose + MySQL

Example stack (database + app): see `docker-compose.prod.yml`.

Create a `.env.production` (or export variables) with:

- `DATABASE_URL` pointing at the MySQL service (e.g. `mysql://lms:lms@db:3306/lms` if you use the same user/db as in the compose file)
- `JWT_*`, `FRONTEND_ORIGIN`, `MYSQL_*` if you customize the DB

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

**Note:** `FRONTEND_ORIGIN` must match the URL users open in the browser (scheme + host + port).

## 3. Railway / Render / Fly.io

1. Connect the repo.
2. **Build** with the root `Dockerfile` (or use Nixpacks with build command `npm install && npm run build -w apps/api && npm run build -w apps/web` and start command from below).
3. Add a **MySQL** plugin or external database; set `DATABASE_URL`.
4. Set the env vars above.

**Start command (without Docker)** if the platform runs Node directly:

```bash
npm run migrate:deploy && NODE_ENV=production npm run start:prod
```

(`start:prod` runs `node --import tsx apps/web/server.ts` from the repo root.)

## 4. Database

- Run migrations **before** or **on** deploy (Dockerfile runs `migrate deploy` at container start).
- **Seed** is optional (`npm run prisma:seed -w apps/api`) — run once from a secure admin context, not in public CI without secrets.

## 5. HTTPS

Terminate TLS at your reverse proxy (nginx, Caddy, Railway, etc.) or the platform’s edge. Set `FRONTEND_ORIGIN` to the HTTPS URL and `REFRESH_COOKIE_SECURE=true`.

## 6. Troubleshooting

- **CORS / cookies**: `FRONTEND_ORIGIN` must match the browser tab URL exactly.
- **502 / crash**: Check logs; often missing `DATABASE_URL` or failed migrations.
- **Health**: `GET /health` should return `{ "ok": true }`.
