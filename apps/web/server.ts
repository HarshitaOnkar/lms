import "./loadEnv";

import path from "path";

import express from "express";
import next from "next";

import { attachApi } from "../api/src/attachApi";

/** Always point Next at this app (`apps/web`), not `process.cwd()` (often the monorepo root). */
const webRoot = path.resolve(__dirname);

// `loadEnv` loads `apps/api/.env`, which often sets PORT=4000 for standalone `apps/api` dev.
// Combined dev should default to 3001; use WEB_PORT to override. In production, use the host's PORT.
const port = parseInt(
  process.env.WEB_PORT ??
    (process.env.NODE_ENV === "production" ? process.env.PORT : undefined) ??
    "3001",
  10
);
process.env.PORT = String(port);

const dev = process.env.NODE_ENV !== "production";
const host = process.env.HOST ?? (dev ? "localhost" : "0.0.0.0");

async function main() {
  const expressApp = express();
  if (!dev) {
    expressApp.set("trust proxy", 1);
  }

  // Webpack dev avoids Turbopack issues with Express + Windows. `dir` must be apps/web (see above).
  const nextApp = next({
    dev,
    hostname: host,
    port,
    dir: webRoot,
    ...(dev ? { webpack: true as const } : {})
  });
  await nextApp.prepare();
  const handle = nextApp.getRequestHandler();

  attachApi(expressApp, {
    mode: "combined",
    nextHandler: (req, res) => handle(req, res)
  });

  expressApp.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(
      `LMS ready (Next.js + /api) — http://${host}:${port}  NODE_ENV=${process.env.NODE_ENV ?? "development"}`
    );
  });
}

void main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
