import type { PrismaClient } from "@prisma/client";

export class ProgressRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getVideoProgress(userId: number, videoId: number) {
    return this.prisma.video_progress.findUnique({
      where: { user_id_video_id: { user_id: userId, video_id: videoId } }
    });
  }

  async upsertVideoProgress(params: {
    userId: number;
    videoId: number;
    last_position_seconds: number;
    is_completed: boolean;
    completed_at: Date | null;
  }) {
    return this.prisma.video_progress.upsert({
      where: { user_id_video_id: { user_id: params.userId, video_id: params.videoId } },
      create: {
        user_id: params.userId,
        video_id: params.videoId,
        last_position_seconds: params.last_position_seconds,
        is_completed: params.is_completed,
        completed_at: params.completed_at
      },
      update: {
        last_position_seconds: params.last_position_seconds,
        is_completed: params.is_completed,
        completed_at: params.completed_at
      }
    });
  }

  async getCompletedVideoIdsForSubject(userId: number, subjectId: number) {
    const rows = await this.prisma.video_progress.findMany({
      where: {
        user_id: userId,
        is_completed: true,
        video: { section: { subject_id: subjectId } }
      },
      select: { video_id: true }
    });
    return new Set(rows.map((r) => r.video_id));
  }
}
