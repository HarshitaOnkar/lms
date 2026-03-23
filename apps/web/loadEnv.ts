import path from "path";
import dotenv from "dotenv";

/**
 * Load shared API env before Prisma / attachApi imports (must be imported first in server.ts).
 * Uses apps/api/.env — keep DATABASE_URL + JWT secrets there (or symlink a root .env).
 */
dotenv.config({ path: path.resolve(__dirname, "../api/.env") });
// Optional: `WEB_PORT`, etc. (file may be missing)
dotenv.config({ path: path.resolve(__dirname, ".env.local") });
