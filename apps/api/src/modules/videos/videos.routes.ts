import { Router } from "express";

import type { Env } from "../../config/env";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import type { VideosController } from "./videos.controller";

export function createVideosRouter(env: Env, controller: VideosController) {
  const r = Router();
  r.use(requireAuth(env));

  r.get("/:id", asyncHandler(controller.getById));
  return r;
}
