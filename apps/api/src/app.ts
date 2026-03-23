import express from "express";

import { attachApi } from "./attachApi";

export function createApp() {
  const app = express();
  let env: ReturnType<typeof attachApi> | null = null;
  try {
    env = attachApi(app, { mode: "standalone" });
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Unknown bootstrap error";
    // Keep function alive on misconfigured deployments; return actionable response.
    // eslint-disable-next-line no-console
    console.error("API bootstrap failed.", error);

    app.get("/health", (_req, res) => {
      res.status(503).json({
        status: "degraded",
        message: "API is not configured.",
        reason,
        required_env: [
          "DATABASE_URL (mysql://...)",
          "JWT_ACCESS_SECRET",
          "JWT_REFRESH_SECRET"
        ]
      });
    });

    app.use((_req, res) => {
      res.status(503).json({
        message: "API is not configured.",
        reason,
        required_env: [
          "DATABASE_URL (mysql://...)",
          "JWT_ACCESS_SECRET",
          "JWT_REFRESH_SECRET"
        ]
      });
    });
  }
  return { app, env };
}
