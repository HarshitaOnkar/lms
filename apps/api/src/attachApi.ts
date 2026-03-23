import cookieParser from "cookie-parser";
import cors from "cors";
import type { CorsOptions } from "cors";
import express, { type Express, type Request, type Response } from "express";

import { loadEnv } from "./config/env";
import type { Env } from "./config/env";
import { getPrisma } from "./lib/prisma";
import { errorHandler } from "./middleware/errorHandler";
import { AuthController } from "./modules/auth/auth.controller";
import { AuthRepository } from "./modules/auth/auth.repository";
import { AuthService } from "./modules/auth/auth.service";
import { createAuthRouter } from "./modules/auth/auth.routes";
import { EnrollmentsController } from "./modules/enrollments/enrollments.controller";
import { EnrollmentsService } from "./modules/enrollments/enrollments.service";
import { createEnrollmentsRouter } from "./modules/enrollments/enrollments.routes";
import { ProgressController } from "./modules/progress/progress.controller";
import { ProgressRepository } from "./modules/progress/progress.repository";
import { ProgressService } from "./modules/progress/progress.service";
import { createProgressRouter } from "./modules/progress/progress.routes";
import { SubjectsController } from "./modules/subjects/subjects.controller";
import { SubjectsRepository } from "./modules/subjects/subjects.repository";
import { SubjectsService } from "./modules/subjects/subjects.service";
import { createSubjectsRouter } from "./modules/subjects/subjects.routes";
import { VideosController } from "./modules/videos/videos.controller";
import { VideosService } from "./modules/videos/videos.service";
import { createVideosRouter } from "./modules/videos/videos.routes";
import { UsersController } from "./modules/users/users.controller";
import { UsersService } from "./modules/users/users.service";
import { createUsersRouter } from "./modules/users/users.routes";
import { healthRouter } from "./routes/health";

function corsOriginOption(env: Env): CorsOptions["origin"] {
  return (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    // If no frontend origin is configured, allow cross-origin requests by default.
    if (!env.FRONTEND_ORIGIN) {
      callback(null, true);
      return;
    }
    if (env.FRONTEND_ORIGIN && origin === env.FRONTEND_ORIGIN) {
      callback(null, true);
      return;
    }
    if (env.NODE_ENV !== "production") {
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
        callback(null, true);
        return;
      }
    }
    callback(new Error(`CORS blocked for ${origin}`));
  };
}

export type AttachApiOptions =
  | { mode: "standalone" }
  | { mode: "combined"; nextHandler: (req: Request, res: Response) => void | Promise<void> };

/**
 * Mount LMS REST API on an Express app.
 * - `standalone`: API-only (404 JSON for any unknown path).
 * - `combined`: unknown `/api/*` and `/health/*` → 404 JSON; everything else → Next.js.
 */
export function attachApi(app: Express, options: AttachApiOptions): Env {
  const env = loadEnv();
  const prisma = getPrisma();

  app.use(
    cors({
      origin: corsOriginOption(env),
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use("/health", healthRouter);

  const authRepo = new AuthRepository(prisma);
  const subjectsRepo = new SubjectsRepository(prisma);
  const progressRepo = new ProgressRepository(prisma);

  const authService = new AuthService(env, authRepo);
  const subjectsService = new SubjectsService(prisma, subjectsRepo, progressRepo);
  const videosService = new VideosService(prisma, progressRepo);
  const progressService = new ProgressService(env, prisma, progressRepo);
  const enrollmentsService = new EnrollmentsService(prisma);
  const usersService = new UsersService(prisma);

  const authController = new AuthController(env, authService);
  const subjectsController = new SubjectsController(subjectsService);
  const videosController = new VideosController(videosService);
  const progressController = new ProgressController(progressService);
  const enrollmentsController = new EnrollmentsController(enrollmentsService);
  const usersController = new UsersController(usersService);

  app.use("/api/auth", createAuthRouter(authController));
  app.use("/api/subjects", createSubjectsRouter(env, subjectsController));
  app.use("/api/videos", createVideosRouter(env, videosController));
  app.use("/api/progress", createProgressRouter(env, progressController));
  app.use("/api/enrollments", createEnrollmentsRouter(env, enrollmentsController));
  app.use("/api/users", createUsersRouter(env, usersController));
  app.get("/", (_req, res) => {
    res.json({
      ok: true,
      service: "lms-api",
      health: "/health",
      routes: [
        "/api/auth",
        "/api/subjects",
        "/api/videos",
        "/api/progress",
        "/api/enrollments",
        "/api/users",
        "/api/ai/chat"
      ]
    });
  });
  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    try {
      const userMessage = String(req.body?.message ?? "").trim();
      if (!userMessage) {
        return res.status(400).json({ message: "message is required" });
      }

      const token = process.env.HF_TOKEN;
      if (!token) {
        return res.status(500).json({
          message: "HF_TOKEN is not configured on the server."
        });
      }

      const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: `<s>[INST] You are LMS AI Assistant. Give concise, practical answers about courses, learning paths, and study planning.\n\n${userMessage} [/INST]`,
            parameters: {
              max_new_tokens: 200,
              temperature: 0.7,
              return_full_text: false
            }
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        // eslint-disable-next-line no-console
        console.error("Hugging Face inference error:", response.status, errText);
        return res.status(502).json({ message: "AI provider failed to generate response." });
      }

      const data = (await response.json()) as Array<{ generated_text?: string }> | { generated_text?: string };
      const text = Array.isArray(data)
        ? (data[0]?.generated_text ?? "").trim()
        : (data.generated_text ?? "").trim();

      if (!text) {
        return res.status(502).json({ message: "Empty AI response." });
      }

      return res.json({ reply: text });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("AI chat route crashed:", error);
      return res.status(500).json({ message: "Failed to process AI chat request." });
    }
  });

  if (options.mode === "standalone") {
    app.use((_req, res) => res.status(404).json({ message: "Not found" }));
  } else {
    app.use((req, res, next) => {
      if (res.headersSent) return next();
      if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
        return res.status(404).json({ message: "Not found" });
      }
      next();
    });
    // Express 5 / path-to-regexp: no bare `*` pattern — use a pathless `use` as catch-all for Next.
    app.use((req, res) => {
      void options.nextHandler(req, res);
    });
  }

  app.use(errorHandler);

  return env;
}
