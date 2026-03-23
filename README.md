## LMS Monorepo

### Apps
- `apps/web`: Next.js (App Router) + Tailwind + Zustand
- `apps/api`: Express + Prisma (MySQL) + JWT auth

### Database (local MySQL)

Use **Docker** so the DB is created on your machine (no cloud provider required):

1. **Start MySQL** (from repo root):

```bash
docker compose up -d
```

Wait until the container is healthy (`docker compose ps`).

2. **Configure `apps/api/.env`** — copy from `apps/api/.env.example` and set:

- `DATABASE_URL` — default for Docker: `mysql://lms:lms@localhost:3306/lms`
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (≥16 characters each)

If you already have a MySQL install elsewhere, create an empty database and user, then put that URL in `DATABASE_URL` instead.

3. **Prisma** (schema + seed):

```bash
npm run prisma:generate -w apps/api
npm run prisma:migrate -w apps/api
npm run prisma:seed -w apps/api
```

4. Verify connection (optional):

```bash
node apps/api/scripts/test-db.js
```

### Other setup

1. Install dependencies:

```bash
npm install
```

2. **Web (optional)**: only if the API runs on a different origin, copy `apps/web/.env.example` to `apps/web/.env.local` and set `NEXT_PUBLIC_API_BASE_URL`.

### Dev server (single process)

Frontend and API share **one port** (default **3001**): Next.js and Express are started together from `apps/web/server.ts`.

```bash
npm run dev
```

- Keep `FRONTEND_ORIGIN` in `apps/api/.env` aligned with that port (e.g. `http://localhost:3001`).  
  `PORT` in `apps/api/.env` is for **standalone** API only; the combined server ignores it in development and listens on **3001** unless you set **`WEB_PORT`** (e.g. `WEB_PORT=4000` in the shell or `apps/web/.env.local`).
- **API-only** (e.g. debugging backend alone): `npm run dev:api` in `apps/api` (default port **4000** unless `PORT` is set in `.env`).

If register/login shows **“Failed to fetch”**, the combined server is not running, the port is wrong, or the DB is unreachable — check the terminal and that MySQL is up.

### Notes
- Refresh tokens are stored in DB (hashed) and delivered via HTTP-only cookie on `/api/auth/*`.
- Access tokens are returned as JSON and stored in the web client `localStorage` for simplicity; refresh uses cookies + `/api/auth/refresh`.

### Register/login fails with DB errors
1. **MySQL running**: `docker compose ps` (or your local service).
2. **`DATABASE_URL`** in `apps/api/.env` matches host, port, database name, user, and password.
3. **Migrations applied**: `npm run prisma:migrate -w apps/api`.
4. Restart dev after changing `.env`.

### “Internal Server Error” or missing `routes-manifest.json` / `.next` on `/login`
Next must use the **`apps/web`** folder as the app root. The dev server sets this explicitly; if you still see 500s:

1. **Stop** `npm run dev` (Ctrl+C).
2. Delete caches: **`npm run clean:web`**. Also remove a stray **`.next`** folder at the **monorepo root** if it exists (wrong place).
3. Run **`npm run dev`** again from the repo root and wait for the first compile.

### Production deployment

See **[DEPLOY.md](./DEPLOY.md)** for Docker, Docker Compose, Railway / Render / Fly.io, and required env vars.

Quick reference:

```bash
npm run docker:build    # build image (Docker required)
npm run migrate:deploy  # apply migrations (CI / VPS)
npm run start:prod      # run built app (set NODE_ENV=production + env vars)
```

Use the root **`Dockerfile`** (migrations run on container start). For app + MySQL on a VPS, see **`docker-compose.prod.yml`**.
