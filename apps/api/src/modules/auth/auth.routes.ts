import { Router } from "express";

import { asyncHandler } from "../../middleware/asyncHandler";
import type { AuthController } from "./auth.controller";

export function createAuthRouter(controller: AuthController) {
  const r = Router();

  r.post("/register", asyncHandler(controller.register));
  r.post("/login", asyncHandler(controller.login));
  r.post("/refresh", asyncHandler(controller.refresh));
  r.post("/logout", asyncHandler(controller.logout));

  return r;
}
