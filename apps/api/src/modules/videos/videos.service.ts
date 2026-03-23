import type { PrismaClient } from "@prisma/client";

import { extractYoutubeVideoId, toYoutubeEmbedUrl } from "../../lib/youtube";
import { HttpError } from "../../middleware/errorHandler";
import type { ProgressRepository } from "../progress/progress.repository";
import { computeLockState, loadOrderedVideosForSubject } from "./videoOrder";

export class VideosService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly progressRepo: ProgressRepository
  ) {}

  async getVideo(userId: number, videoId: number) {
    const video = await this.prisma.videos.findFirst({
      where: { id: videoId },
      include: { section: { include: { subject: true } } }
    });

    if (!video) throw new HttpError(404, "Video not found");
    if (!video.section.subject.is_published) throw new HttpError(404, "Video not found");

    const subjectId = video.section.subject_id;

    const enrolled = await this.prisma.enrollments.findUnique({
      where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } }
    });
    if (!enrolled) throw new HttpError(403, "Not enrolled in subject");

    const ordered = await loadOrderedVideosForSubject(this.prisma, subjectId);
    const completedIds = await this.progressRepo.getCompletedVideoIdsForSubject(userId, subjectId);

    const lock = computeLockState({ ordered, videoId, completedVideoIds: completedIds });
    const progress = await this.progressRepo.getVideoProgress(userId, videoId);

    const youtube_video_id = extractYoutubeVideoId(video.youtube_url);

    return {
      video: {
        id: video.id,
        subject_id: subjectId,
        title: video.title,
        description: video.description,
        youtube_url: video.youtube_url,
        youtube_video_id,
        embed_url: toYoutubeEmbedUrl(youtube_video_id),
        duration_seconds: video.duration_seconds,
        section: {
          id: video.section.id,
          title: video.section.title,
          order_index: video.section.order_index
        },
        subject: {
          id: video.section.subject.id,
          title: video.section.subject.title
        }
      },
      locked: lock.locked,
      unlock_reason: lock.unlock_reason,
      previous_video_id: lock.previous_video_id,
      next_video_id: lock.next_video_id,
      progress: {
        last_position_seconds: progress?.last_position_seconds ?? 0,
        is_completed: progress?.is_completed ?? false,
        completed_at: progress?.completed_at ? progress.completed_at.toISOString() : null
      }
    };
  }
}
