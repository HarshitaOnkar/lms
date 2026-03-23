import { Router } from "express";

import type { Env } from "../../config/env";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import type { SubjectsController } from "./subjects.controller";

export function createSubjectsRouter(env: Env, controller: SubjectsController) {
  const r = Router();

  r.use(requireAuth(env));

  r.get("/", asyncHandler(controller.list));
  r.get("/:id", asyncHandler(controller.getById));
  r.get("/:id/tree", asyncHandler(controller.getTree));

  return r;
}
