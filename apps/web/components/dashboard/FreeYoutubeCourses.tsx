"use client";

import { useCallback, useEffect, useState } from "react";

export type FreeYoutubeCourse = {
  videoId: string;
  title: string;
};

export const FREE_PYTHON_YOUTUBE_COURSES: FreeYoutubeCourse[] = [
  { videoId: "rfscVS0vtbw", title: "Python Full Course for Beginners - Programming with Mosh" },
  { videoId: "9N6a-VLBa2I", title: "Python Tutorial 2026 - Telusko" },
  { videoId: "_uQrJ0TkZlc", title: "Python for Beginners Full Course - Telusko" },
  { videoId: "XnSasPR2KJI", title: "Python Tutorial for Beginners - Apna College" },
  { videoId: "gfDE2a7MKjA", title: "Complete Python Course - CodeWithHarry" },
  {
    videoId: "gPvYox9JIYI",
    title: "Python Full Course For Beginners | Job Ready Python Course by Sagar Chouksey"
  }
];

function thumbnailUrl(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/0.jpg`;
}

function watchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function embedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`;
}

export function FreeYoutubeCourses() {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const closePlayer = useCallback(() => setPlayingId(null), []);

  useEffect(() => {
    if (!playingId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePlayer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playingId, closePlayer]);

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-8 pt-2">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-white">Free Python courses</h1>
        <p className="mt-1 text-sm text-neutral-400">Curated YouTube playlists — tap a course to watch here</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FREE_PYTHON_YOUTUBE_COURSES.map((c, idx) => (
          <button
            key={`${c.videoId}-${idx}`}
            type="button"
            onClick={() => setPlayingId(c.videoId)}
            className="group flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/80 text-left shadow-lg transition hover:border-neutral-600 hover:bg-neutral-900"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <img
                src={thumbnailUrl(c.videoId)}
                alt={c.title}
                className="h-full w-full object-cover transition group-hover:opacity-90"
                loading="lazy"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-80 transition group-hover:bg-black/30">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                  <svg className="ml-1 h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </div>
            <div className="p-3">
              <h2 className="line-clamp-3 text-sm font-semibold leading-snug text-white">{c.title}</h2>
              <p className="mt-2 text-xs text-neutral-500">YouTube</p>
            </div>
          </button>
        ))}
      </div>

      {playingId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
          onClick={closePlayer}
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={closePlayer}
              className="absolute -right-1 -top-10 rounded-full bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700 sm:-right-2 sm:-top-12"
            >
              Close
            </button>
            <div className="video-container overflow-visible rounded-lg border border-neutral-700 bg-black shadow-2xl">
              <iframe
                title={FREE_PYTHON_YOUTUBE_COURSES.find((c) => c.videoId === playingId)?.title ?? "YouTube video"}
                src={embedUrl(playingId)}
                className="h-full w-full"
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
            <a
              href={watchUrl(playingId)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-amber-400 underline hover:text-amber-300"
            >
              Open on YouTube
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
