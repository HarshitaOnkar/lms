import type { PrismaClient } from "@prisma/client";

import { HttpError } from "../../middleware/errorHandler";

export class EnrollmentsService {
  constructor(private readonly prisma: PrismaClient) {}

  async enroll(userId: number, subjectId: number) {
    const subject = await this.prisma.subjects.findFirst({
      where: { id: subjectId, is_published: true }
    });
    if (!subject) throw new HttpError(404, "Subject not found");

    await this.prisma.enrollments.upsert({
      where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } },
      create: { user_id: userId, subject_id: subjectId },
      update: {}
    });

    return { ok: true };
  }
}
