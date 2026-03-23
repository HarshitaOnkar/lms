import type { Request, Response } from "express";

import { getAuthUserId } from "../../middleware/auth";
import { HttpError } from "../../middleware/errorHandler";
import type { EnrollmentsService } from "./enrollments.service";

export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  enrollSubject = async (req: Request, res: Response) => {
    const userId = getAuthUserId(req);
    const subjectId = Number(req.params.subjectId);
    if (!Number.isFinite(subjectId)) throw new HttpError(400, "Invalid subject id");
    return res.json(await this.service.enroll(userId, subjectId));
  };
}
