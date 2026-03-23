import type { Request, Response } from "express";

import { getAuthUserId } from "../../middleware/auth";
import { HttpError } from "../../middleware/errorHandler";
import type { ProgressService } from "./progress.service";

export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  getVideo = async (req: Request, res: Response) => {
    const userId = getAuthUserId(req);
    const videoId = Number(req.params.videoId);
    if (!Number.isFinite(videoId)) throw new HttpError(400, "Invalid video id");
    return res.json(await this.service.getVideoProgress(userId, videoId));
  };

  updateVideo = async (req: Request, res: Response) => {
    const userId = getAuthUserId(req);
    const videoId = Number(req.params.videoId);
    if (!Number.isFinite(videoId)) throw new HttpError(400, "Invalid video id");
    return res.json(await this.service.updateVideoProgress(userId, videoId, req.body));
  };

  getSubject = async (req: Request, res: Response) => {
    const userId = getAuthUserId(req);
    const subjectId = Number(req.params.subjectId);
    if (!Number.isFinite(subjectId)) throw new HttpError(400, "Invalid subject id");
    return res.json(await this.service.getSubjectProgress(userId, subjectId));
  };
}
