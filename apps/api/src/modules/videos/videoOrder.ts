import type { PrismaClient } from "@prisma/client";

export type OrderedVideo = {
  id: number;
  section_id: number;
  order_index: number;
  duration_seconds: number;
};

export async function loadOrderedVideosForSubject(
  prisma: PrismaClient,
  subjectId: number
): Promise<OrderedVideo[]> {
  const sections = await prisma.sections.findMany({
    where: { subject_id: subjectId },
    orderBy: [{ order_index: "asc" }, { id: "asc" }],
    select: { id: true }
  });

  const videos: OrderedVideo[] = [];

  for (const section of sections) {
    const sectionVideos = await prisma.videos.findMany({
      where: { section_id: section.id },
      orderBy: [{ order_index: "asc" }, { id: "asc" }],
      select: {
        id: true,
        section_id: true,
        order_index: true,
        duration_seconds: true
      }
    });
    videos.push(...sectionVideos);
  }

  return videos;
}

export function findPrevNext(
  ordered: OrderedVideo[],
  videoId: number
): { index: number; previous_video_id: number | null; next_video_id: number | null } {
  const index = ordered.findIndex((v) => v.id === videoId);
  if (index === -1) {
    return { index: -1, previous_video_id: null, next_video_id: null };
  }

  const previous_video_id = index > 0 ? ordered[index - 1]!.id : null;
  const next_video_id = index < ordered.length - 1 ? ordered[index + 1]!.id : null;

  return { index, previous_video_id, next_video_id };
}

export function computeLockState(params: {
  ordered: OrderedVideo[];
  videoId: number;
  completedVideoIds: Set<number>;
}): {
  locked: boolean;
  unlock_reason: string;
  previous_video_id: number | null;
  next_video_id: number | null;
} {
  const { ordered, videoId, completedVideoIds } = params;
  const { index, previous_video_id, next_video_id } = findPrevNext(ordered, videoId);

  if (index === -1) {
    return {
      locked: true,
      unlock_reason: "VIDEO_NOT_FOUND",
      previous_video_id: null,
      next_video_id: null
    };
  }

  if (index === 0) {
    return {
      locked: false,
      unlock_reason: "FIRST_VIDEO",
      previous_video_id,
      next_video_id
    };
  }

  const prevId = previous_video_id;
  const prevCompleted = prevId ? completedVideoIds.has(prevId) : false;

  if (!prevCompleted) {
    return {
      locked: true,
      unlock_reason: "PREVIOUS_VIDEO_NOT_COMPLETED",
      previous_video_id,
      next_video_id
    };
  }

  return {
    locked: false,
    unlock_reason: "PREVIOUS_VIDEO_COMPLETED",
    previous_video_id,
    next_video_id
  };
}
