import type { Request, Response } from "express";

import type { Env } from "../../config/env";
import type { AuthService } from "./auth.service";

export class AuthController {
  constructor(
    private readonly env: Env,
    private readonly service: AuthService
  ) {}

  register = async (req: Request, res: Response) => {
    const result = await this.service.register(req.body);
    return res.status(201).json({ user: result.user });
  };

  login = async (req: Request, res: Response) => {
    const result = await this.service.login(req.body);
    this.service.setRefreshCookie(res, result.refresh_token);
    return res.json({
      user: result.user,
      access_token: result.access_token
    });
  };

  refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[this.env.REFRESH_COOKIE_NAME] as string | undefined;
    const result = await this.service.refresh(refreshToken);
    this.service.setRefreshCookie(res, result.refresh_token);
    return res.json({ access_token: result.access_token });
  };

  logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[this.env.REFRESH_COOKIE_NAME] as string | undefined;
    await this.service.logout(refreshToken);
    this.service.clearRefreshCookie(res);
    return res.json({ ok: true });
  };
}
