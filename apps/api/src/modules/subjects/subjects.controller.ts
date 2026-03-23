import type { Request, Response } from "express";

import { getAuthUserId } from "../../middleware/auth";
import { HttpError } from "../../middleware/errorHandler";
import type { SubjectsService } from "./subjects.service";

export class SubjectsController {
  constructor(private readonly service: SubjectsService) {}

  list = async (req: Request, res: Response) => {
    const userId = getAuthUserId(req);
    const raw = req.query.pricing;
    const pricing =
      raw === "free" || raw === "paid" ? raw : undefined;
    return res.json(await this.service.listSubjects(userId, pricing));
  };

  getById = async (req: Request, res: Response) => {
    const userId = getAuthUserId(req);
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new HttpError(400, "Invalid subject id");
    return res.json(await this.service.getSubject(userId, id));
  };

  getTree = async (req: Request, res: Response) => {
    const userId = getAuthUserId(req);
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new HttpError(400, "Invalid subject id");
    return res.json(await this.service.getTree(userId, id));
  };
}
