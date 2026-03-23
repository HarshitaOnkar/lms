"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { VideoPlayer } from "../../../components/VideoPlayer";
import { apiFetch } from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";

type TreeResponse = {
  subject: { id: number; title: string; description: string | null; is_published: boolean; progress_percent: number };
  sections: Array<{
    id: number;
    title: string;
    order_index: number;
    videos: Array<{
      id: number;
      title: string;
      locked: boolean;
      unlock_reason: string;
      youtube_video_id: string;
      embed_url: string;
      duration_seconds: number;
      progress: { last_position_seconds: number; is_completed: boolean; completed_at: string | null };
    }>;
  }>;
};

type VideoDetails = {
  video: {
    id: number;
    title: string;
    description: string | null;
    youtube_video_id: string;
    embed_url: string;
    duration_seconds: number;
  };
  locked: boolean;
  unlock_reason: string;
  previous_video_id: number | null;
  next_video_id: number | null;
  progress: { last_position_seconds: number; is_completed: boolean; completed_at: string | null };
};

export default function SubjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();

  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const user = useAuthStore((s) => s.user);

  const subjectId = Number(params.id);
  const selectedFromQuery = Number(search.get("video") ?? "NaN");

  const [tree, setTree] = useState<TreeResponse | null>(null);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  const selectedVideoId = useMemo(() => {
    if (Number.isFinite(selectedFromQuery)) return selectedFromQuery;
    return NaN;
  }, [selectedFromQuery]);

  useEffect(() => {
    if (!bootstrapped) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!Number.isFinite(subjectId)) {
      setError("Invalid subject");
      return;
    }

    void (async () => {
      const res = await apiFetch(`/api/subjects/${subjectId}/tree`, { method: "GET" });
      if (!res.ok) {
        const msg = (await res.json().catch(() => null)) as { message?: string } | null;
        setError(msg?.message ?? "Failed to load subject");
        return;
      }
      setTree((await res.json()) as TreeResponse);
    })();
  }, [bootstrapped, user, router, subjectId]);

  useEffect(() => {
    if (!bootstrapped || !user) return;
    if (!Number.isFinite(subjectId)) return;

    const videoId = Number.isFinite(selectedVideoId)
      ? selectedVideoId
      : (() => {
          const first = tree?.sections.flatMap((s) => s.videos).find((v) => !v.locked);
          return first?.id ?? NaN;
        })();

    if (!Number.isFinite(videoId)) return;

    void (async () => {
      const res = await apiFetch(`/api/videos/${videoId}`, { method: "GET" });
      if (!res.ok) {
        setError("Failed to load video");
        return;
      }
      setVideoDetails((await res.json()) as VideoDetails);
    })();
  }, [bootstrapped, user, subjectId, selectedVideoId, tree]);

  function selectVideo(videoId: number) {
    router.push(`/subjects/${subjectId}?video=${videoId}`);
  }

  async function postProgress(seconds: number) {
    if (!videoDetails) return;
    const res = await apiFetch(`/api/progress/videos/${videoDetails.video.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ last_position_seconds: Math.floor(seconds) })
    });
    if (!res.ok) return;
    // Refresh tree for progress bar updates
    const t = await apiFetch(`/api/subjects/${subjectId}/tree`, { method: "GET" });
    if (t.ok) setTree((await t.json()) as TreeResponse);
  }

  function scheduleProgress(seconds: number) {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void postProgress(seconds);
    }, 750);
  }

  async function handleEnded() {
    if (!videoDetails) return;
    await postProgress(videoDetails.video.duration_seconds);
    const res = await apiFetch(`/api/videos/${videoDetails.video.id}`, { method: "GET" });
    if (!res.ok) return;
    const details = (await res.json()) as VideoDetails;
    if (details.next_video_id) {
      selectVideo(details.next_video_id);
    }
  }

  if (!bootstrapped || !user) return <div className="text-sm text-gray-600">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!tree) return <div className="text-sm text-gray-600">Loading subject…</div>;

  const currentVideoId = Number.isFinite(selectedVideoId)
    ? selectedVideoId
    : tree.sections.flatMap((s) => s.videos).find((v) => !v.locked)?.id;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="text-sm text-gray-600">Subject</div>
        <div className="text-lg font-semibold">{tree.subject.title}</div>
        <div className="mt-2 text-xs text-gray-600">Progress: {tree.subject.progress_percent}%</div>

        <div className="mt-4 space-y-4">
          {tree.sections.map((section) => (
            <div key={section.id}>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{section.title}</div>
              <div className="mt-2 space-y-1">
                {section.videos.map((v) => {
                  const active = v.id === currentVideoId;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={v.locked}
                      onClick={() => selectVideo(v.id)}
                      className={[
                        "flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm",
                        active ? "bg-gray-100" : "hover:bg-gray-50",
                        v.locked ? "cursor-not-allowed opacity-60" : ""
                      ].join(" ")}
                    >
                      <span className="truncate">{v.title}</span>
                      {v.locked ? <span title={v.unlock_reason}>🔒</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="rounded-lg border bg-white p-5 shadow-sm">
        {!videoDetails ? (
          <div className="text-sm text-gray-600">Select a video…</div>
        ) : (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xl font-semibold">{videoDetails.video.title}</div>
                {videoDetails.video.description ? (
                  <div className="mt-2 text-sm text-gray-600">{videoDetails.video.description}</div>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                  disabled={!videoDetails.previous_video_id}
                  onClick={() =>
                    videoDetails.previous_video_id && selectVideo(videoDetails.previous_video_id)
                  }
                >
                  Previous
                </button>
                <button
                  className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                  disabled={!videoDetails.next_video_id}
                  onClick={() => videoDetails.next_video_id && selectVideo(videoDetails.next_video_id)}
                >
                  Next
                </button>
              </div>
            </div>

            {videoDetails.locked ? (
              <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                This video is locked ({videoDetails.unlock_reason}).
              </div>
            ) : null}

            <div className="mt-4">
              <VideoPlayer
                title={videoDetails.video.title}
                videoId={videoDetails.video.youtube_video_id}
                startSeconds={videoDetails.progress.last_position_seconds}
                disabled={videoDetails.locked}
                onTime={(t) => scheduleProgress(t)}
                onEnded={() => void handleEnded()}
              />
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Progress updates are debounced while playing. Completion is enforced server-side.
            </div>

            <div className="mt-6">
              <Link className="text-sm underline" href="/free-courses">
                Back to courses
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
