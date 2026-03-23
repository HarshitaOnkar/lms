import jwt from "jsonwebtoken";
import { z } from "zod";

import type { Env } from "../config/env";

const accessPayloadSchema = z.object({
  sub: z.number(),
  typ: z.literal("access")
});

const refreshPayloadSchema = z.object({
  sub: z.number(),
  typ: z.literal("refresh"),
  jti: z.string()
});

export type JwtAccessPayload = z.infer<typeof accessPayloadSchema>;
export type JwtRefreshPayload = z.infer<typeof refreshPayloadSchema>;

export function signAccessToken(env: Env, userId: number): string {
  return jwt.sign({ sub: userId, typ: "access" }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL_SECONDS
  });
}

export function signRefreshToken(env: Env, userId: number, jti: string): string {
  return jwt.sign({ sub: userId, typ: "refresh", jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL_SECONDS
  });
}

export function verifyAccessToken(env: Env, token: string): JwtAccessPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  return accessPayloadSchema.parse(decoded);
}

export function verifyRefreshToken(env: Env, token: string): JwtRefreshPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  return refreshPayloadSchema.parse(decoded);
}
