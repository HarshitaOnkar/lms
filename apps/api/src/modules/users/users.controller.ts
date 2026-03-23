import type { Request, Response } from "express";

import { getAuthUserId } from "../../middleware/auth";
import type { UsersService } from "./users.service";

export class UsersController {
  constructor(private readonly service: UsersService) {}

  me = async (req: Request, res: Response) => {
    const userId = getAuthUserId(req);
    return res.json(await this.service.me(userId));
  };
}
