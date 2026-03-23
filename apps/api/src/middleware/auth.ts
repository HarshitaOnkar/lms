import type { NextFunction, Request, Response } from "express";
import { JsonWebTokenError } from "jsonwebtoken";

import type { Env } from "../config/env";
import { verifyAccessToken } from "../lib/jwt";
import { HttpError } from "./errorHandler";

function getBearerToken(req: Request): string | null {
  const header = req.header("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token;
}

export function requireAuth(env: Env) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = getBearerToken(req);
      if (!token) throw new HttpError(401, "Unauthorized");

      const payload = verifyAccessToken(env, token);
      (req as Request & { userId: number }).userId = payload.sub;
      return next();
    } catch (err) {
      if (err instanceof JsonWebTokenError) return next(new HttpError(401, "Unauthorized"));
      return next(err);
    }
  };
}

export function getAuthUserId(req: Request): number {
  const userId = (req as Request & { userId?: number }).userId;
  if (!userId) throw new HttpError(401, "Unauthorized");
  return userId;
}
