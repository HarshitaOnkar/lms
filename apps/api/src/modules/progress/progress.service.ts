import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

import type { Env } from "../../config/env";
import { HttpError } from "../../middleware/errorHandler";
import type { ProgressRepository } from "./progress.repository";
import { computeLockState, loadOrderedVideosForSubject } from "../videos/videoOrder";

const updateSchema = z.object({
  last_position_seconds: z.number().int().min(0)
});

export class ProgressService {
  constructor(
    private readonly env: Env,
    private readonly prisma: PrismaClient,
    private readonly repo: ProgressRepository
  ) {}

  async getVideoProgress(userId: number, videoId: number) {
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
    const completedIds = await this.repo.getCompletedVideoIdsForSubject(userId, subjectId);
    const lock = computeLockState({ ordered, videoId, completedVideoIds: completedIds });

    const row = await this.repo.getVideoProgress(userId, videoId);

    return {
      video_id: videoId,
      locked: lock.locked,
      unlock_reason: lock.unlock_reason,
      previous_video_id: lock.previous_video_id,
      next_video_id: lock.next_video_id,
      progress: {
        last_position_seconds: row?.last_position_seconds ?? 0,
        is_completed: row?.is_completed ?? false,
        completed_at: row?.completed_at ? row.completed_at.toISOString() : null
      }
    };
  }

  async updateVideoProgress(userId: number, videoId: number, body: unknown) {
    const input = updateSchema.parse(body);

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
    const completedIds = await this.repo.getCompletedVideoIdsForSubject(userId, subjectId);
    const lock = computeLockState({ ordered, videoId, completedVideoIds: completedIds });

    if (lock.locked) {
      throw new HttpError(403, "Video is locked", {
        unlock_reason: lock.unlock_reason,
        previous_video_id: lock.previous_video_id
      });
    }

    const duration = video.duration_seconds;
    let position = input.last_position_seconds;
    if (duration > 0) position = Math.min(position, duration);

    const threshold = Math.max(0, duration - this.env.COMPLETION_GRACE_SECONDS);
    const is_completed = duration <= 0 ? true : position >= threshold;

    const existing = await this.repo.getVideoProgress(userId, videoId);
    const completed_at =
      is_completed
        ? existing?.completed_at ?? new Date()
        : null;

    const saved = await this.repo.upsertVideoProgress({
      userId,
      videoId,
      last_position_seconds: position,
      is_completed,
      completed_at
    });

    return {
      video_id: videoId,
      progress: {
        last_position_seconds: saved.last_position_seconds,
        is_completed: saved.is_completed,
        completed_at: saved.completed_at ? saved.completed_at.toISOString() : null
      }
    };
  }

  async getSubjectProgress(userId: number, subjectId: number) {
    const subject = await this.prisma.subjects.findFirst({
      where: { id: subjectId, is_published: true }
    });
    if (!subject) throw new HttpError(404, "Subject not found");

    const enrolled = await this.prisma.enrollments.findUnique({
      where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } }
    });
    if (!enrolled) throw new HttpError(403, "Not enrolled in subject");

    const total = await this.prisma.videos.count({
      where: { section: { subject_id: subjectId } }
    });
    const completed = await this.prisma.video_progress.count({
      where: { user_id: userId, is_completed: true, video: { section: { subject_id: subjectId } } }
    });

    const progress_percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      subject_id: subjectId,
      completed_videos: completed,
      total_videos: total,
      progress_percent
    };
  }
}
