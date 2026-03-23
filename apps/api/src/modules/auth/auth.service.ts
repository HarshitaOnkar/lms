import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { z } from "zod";

import type { Env } from "../../config/env";
import { sha256Hex } from "../../lib/crypto";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/jwt";
import { refreshCookieOptions } from "../../lib/cookies";
import { HttpError } from "../../middleware/errorHandler";
import type { AuthRepository } from "./auth.repository";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export class AuthService {
  constructor(
    private readonly env: Env,
    private readonly repo: AuthRepository
  ) {}

  async register(body: unknown) {
    const input = registerSchema.parse(body);

    const existing = await this.repo.findUserByEmail(input.email);
    if (existing) throw new HttpError(409, "Email already registered");

    const password_hash = await bcrypt.hash(input.password, 12);
    const user = await this.repo.createUser({
      email: input.email,
      password_hash,
      name: input.name
    });

    // No tokens — user must sign in via /login
    return { user: { id: user.id, email: user.email, name: user.name } };
  }

  async login(body: unknown) {
    const input = loginSchema.parse(body);

    const user = await this.repo.findUserByEmail(input.email);
    if (!user) throw new HttpError(401, "Invalid credentials");

    const ok = await bcrypt.compare(input.password, user.password_hash);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    const tokens = await this.issueTokens(user.id);
    return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
  }

  async refresh(refreshTokenFromCookie: string | undefined) {
    if (!refreshTokenFromCookie) throw new HttpError(401, "Missing refresh token");

    const payload = verifyRefreshToken(this.env, refreshTokenFromCookie);
    const token_hash = sha256Hex(refreshTokenFromCookie);

    const row = await this.repo.findRefreshTokenByHash(token_hash);
    if (!row) throw new HttpError(401, "Invalid refresh token");
    if (row.revoked_at) throw new HttpError(401, "Refresh token revoked");
    if (row.expires_at.getTime() <= Date.now()) throw new HttpError(401, "Refresh token expired");
    if (row.user_id !== payload.sub) throw new HttpError(401, "Invalid refresh token");

    // Rotation: revoke old token, issue new refresh token + access token.
    await this.repo.revokeRefreshToken(token_hash);

    const tokens = await this.issueTokens(payload.sub);
    return tokens;
  }

  async logout(refreshTokenFromCookie: string | undefined) {
    if (!refreshTokenFromCookie) return;

    const token_hash = sha256Hex(refreshTokenFromCookie);
    const row = await this.repo.findRefreshTokenByHash(token_hash);
    if (!row) return;
    if (!row.revoked_at) await this.repo.revokeRefreshToken(token_hash);
  }

  setRefreshCookie(res: import("express").Response, refreshToken: string) {
    res.cookie(this.env.REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions(this.env));
  }

  clearRefreshCookie(res: import("express").Response) {
    res.clearCookie(this.env.REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: this.env.REFRESH_COOKIE_SECURE,
      sameSite: "lax",
      path: "/api/auth"
    });
  }

  private async issueTokens(userId: number) {
    const access_token = signAccessToken(this.env, userId);

    const jti = randomUUID();
    const refresh_token = signRefreshToken(this.env, userId, jti);
    const token_hash = sha256Hex(refresh_token);

    const expires_at = new Date(Date.now() + this.env.REFRESH_TOKEN_TTL_SECONDS * 1000);
    await this.repo.createRefreshToken({ user_id: userId, token_hash, expires_at });

    return { access_token, refresh_token };
  }
}
