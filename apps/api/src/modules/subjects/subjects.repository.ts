import type { PrismaClient } from "@prisma/client";

export class SubjectsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listPublished(filter?: { isFree?: boolean }) {
    return this.prisma.subjects.findMany({
      where: {
        is_published: true,
        ...(filter?.isFree === true ? { is_free: true } : {}),
        ...(filter?.isFree === false ? { is_free: false } : {})
      },
      orderBy: { id: "asc" }
    });
  }

  async getPublishedById(subjectId: number) {
    return this.prisma.subjects.findFirst({
      where: { id: subjectId, is_published: true }
    });
  }

  async isEnrolled(userId: number, subjectId: number) {
    const row = await this.prisma.enrollments.findUnique({
      where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } }
    });
    return Boolean(row);
  }

  async countVideos(subjectId: number) {
    return this.prisma.videos.count({
      where: { section: { subject_id: subjectId } }
    });
  }

  async countCompletedVideos(userId: number, subjectId: number) {
    return this.prisma.video_progress.count({
      where: {
        user_id: userId,
        is_completed: true,
        video: { section: { subject_id: subjectId } }
      }
    });
  }

  async getTree(subjectId: number) {
    return this.prisma.subjects.findFirst({
      where: { id: subjectId, is_published: true },
      include: {
        sections: {
          orderBy: [{ order_index: "asc" }, { id: "asc" }],
          include: {
            videos: {
              orderBy: [{ order_index: "asc" }, { id: "asc" }]
            }
          }
        }
      }
    });
  }
}
