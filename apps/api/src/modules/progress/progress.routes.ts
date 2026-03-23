import { Router } from "express";

import type { Env } from "../../config/env";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import type { ProgressController } from "./progress.controller";

export function createProgressRouter(env: Env, controller: ProgressController) {
  const r = Router();
  r.use(requireAuth(env));

  r.get("/videos/:videoId", asyncHandler(controller.getVideo));
  r.post("/videos/:videoId", asyncHandler(controller.updateVideo));
  r.get("/subjects/:subjectId", asyncHandler(controller.getSubject));

  return r;
}
