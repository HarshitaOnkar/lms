import type { CookieOptions } from "express";

import type { Env } from "../config/env";

export function refreshCookieOptions(env: Env): CookieOptions {
  return {
    httpOnly: true,
    secure: env.REFRESH_COOKIE_SECURE,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: env.REFRESH_TOKEN_TTL_SECONDS * 1000
  };
}
