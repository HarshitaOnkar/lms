import type { PrismaClient } from "@prisma/client";

import { extractYoutubeVideoId, toYoutubeEmbedUrl } from "../../lib/youtube";
import { HttpError } from "../../middleware/errorHandler";
import type { ProgressRepository } from "../progress/progress.repository";
import { computeLockState, loadOrderedVideosForSubject } from "../videos/videoOrder";
import type { SubjectsRepository } from "./subjects.repository";

export class SubjectsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly subjectsRepo: SubjectsRepository,
    private readonly progressRepo: ProgressRepository
  ) {}

  async listSubjects(userId: number, pricing?: "free" | "paid") {
    const subjects = await this.subjectsRepo.listPublished(
      pricing === "free" ? { isFree: true } : pricing === "paid" ? { isFree: false } : undefined
    );

    const out = [];
    for (const s of subjects) {
      const enrolled = await this.subjectsRepo.isEnrolled(userId, s.id);
      const total = await this.subjectsRepo.countVideos(s.id);
      const completed = enrolled
        ? await this.subjectsRepo.countCompletedVideos(userId, s.id)
        : 0;

      const progress_percent = total === 0 ? 0 : Math.round((completed / total) * 100);

      out.push({
        id: s.id,
        title: s.title,
        description: s.description,
        is_published: s.is_published,
        is_free: s.is_free,
        is_enrolled: enrolled,
        progress_percent
      });
    }

    return out;
  }

  async getSubject(userId: number, subjectId: number) {
    const subject = await this.subjectsRepo.getPublishedById(subjectId);
    if (!subject) throw new HttpError(404, "Subject not found");

    const enrolled = await this.subjectsRepo.isEnrolled(userId, subjectId);
    const total = await this.subjectsRepo.countVideos(subjectId);
    const completed = enrolled ? await this.subjectsRepo.countCompletedVideos(userId, subjectId) : 0;
    const progress_percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      id: subject.id,
      title: subject.title,
      description: subject.description,
      is_published: subject.is_published,
      is_free: subject.is_free,
      is_enrolled: enrolled,
      progress_percent
    };
  }

  async getTree(userId: number, subjectId: number) {
    const subject = await this.subjectsRepo.getTree(subjectId);
    if (!subject) throw new HttpError(404, "Subject not found");

    const enrolled = await this.subjectsRepo.isEnrolled(userId, subjectId);
    if (!enrolled) throw new HttpError(403, "Not enrolled in subject");

    const ordered = await loadOrderedVideosForSubject(this.prisma, subjectId);
    const completedIds = await this.progressRepo.getCompletedVideoIdsForSubject(userId, subjectId);

    const sections = subject.sections.map((section) => ({
      id: section.id,
      title: section.title,
      order_index: section.order_index,
      videos: section.videos.map((video) => {
        const lock = computeLockState({
          ordered,
          videoId: video.id,
          completedVideoIds: completedIds
        });

        return {
          id: video.id,
          title: video.title,
          description: video.description,
          youtube_url: video.youtube_url,
          youtube_video_id: extractYoutubeVideoId(video.youtube_url),
          embed_url: toYoutubeEmbedUrl(extractYoutubeVideoId(video.youtube_url)),
          order_index: video.order_index,
          duration_seconds: video.duration_seconds,
          locked: lock.locked,
          unlock_reason: lock.unlock_reason,
          previous_video_id: lock.previous_video_id,
          next_video_id: lock.next_video_id,
          progress: {
            last_position_seconds: 0,
            is_completed: false,
            completed_at: null as string | null
          }
        };
      })
    }));

    // Fill progress values (one query per video would be slow; batch fetch instead).
    const videoIds = ordered.map((v) => v.id);
    const progressRows =
      videoIds.length === 0
        ? []
        : await this.prisma.video_progress.findMany({
            where: { user_id: userId, video_id: { in: videoIds } }
          });
    const progressByVideoId = new Map(progressRows.map((p) => [p.video_id, p]));

    for (const section of sections) {
      for (const v of section.videos) {
        const p = progressByVideoId.get(v.id);
        v.progress = {
          last_position_seconds: p?.last_position_seconds ?? 0,
          is_completed: p?.is_completed ?? false,
          completed_at: p?.completed_at ? p.completed_at.toISOString() : null
        };
      }
    }

    const total = ordered.length;
    const completed = await this.subjectsRepo.countCompletedVideos(userId, subjectId);
    const progress_percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      subject: {
        id: subject.id,
        title: subject.title,
        description: subject.description,
        is_published: subject.is_published,
        progress_percent
      },
      sections
    };
  }
}
