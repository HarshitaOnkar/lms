import { Router } from "express";

import type { Env } from "../../config/env";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import type { UsersController } from "./users.controller";

export function createUsersRouter(env: Env, controller: UsersController) {
  const r = Router();
  r.use(requireAuth(env));
  r.get("/me", asyncHandler(controller.me));
  return r;
}
