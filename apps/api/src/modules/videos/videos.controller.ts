import type { Request, Response } from "express";

import { getAuthUserId } from "../../middleware/auth";
import { HttpError } from "../../middleware/errorHandler";
import type { VideosService } from "./videos.service";

export class VideosController {
  constructor(private readonly service: VideosService) {}

  getById = async (req: Request, res: Response) => {
    const userId = getAuthUserId(req);
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new HttpError(400, "Invalid video id");
    return res.json(await this.service.getVideo(userId, id));
  };
}
