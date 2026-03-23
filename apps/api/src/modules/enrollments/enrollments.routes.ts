import { Router } from "express";

import type { Env } from "../../config/env";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import type { EnrollmentsController } from "./enrollments.controller";

export function createEnrollmentsRouter(env: Env, controller: EnrollmentsController) {
  const r = Router();
  r.use(requireAuth(env));

  r.post("/subjects/:subjectId", asyncHandler(controller.enrollSubject));

  return r;
}
