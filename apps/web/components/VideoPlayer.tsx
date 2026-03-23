"use client";

export function buildYoutubeEmbedSrc(
  videoId: string,
  opts?: { autoplay?: boolean; startSeconds?: number }
): string {
  const safeVideoId = normalizeYoutubeVideoId(videoId);
  const p = new URLSearchParams();
  p.set("controls", "1");
  p.set("modestbranding", "1");
  p.set("rel", "0");
  p.set("showinfo", "0");
  if (opts?.autoplay) p.set("autoplay", "1");
  const start = opts?.startSeconds ?? 0;
  if (start > 0) p.set("start", String(Math.floor(start)));
  return `https://www.youtube.com/embed/${safeVideoId}?${p.toString()}`;
}

export function normalizeYoutubeVideoId(input: string): string {
  const raw = input.trim();
  if (!raw) return raw;

  // Already a likely YouTube video ID.
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);

    // Handle redirected links carrying the real URL in query params.
    if (url.hostname.includes("google.") && url.searchParams.get("q")) {
      return normalizeYoutubeVideoId(url.searchParams.get("q") ?? "");
    }

    // Standard query-based YouTube links.
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

    // /embed/VIDEO_ID, /shorts/VIDEO_ID, /live/VIDEO_ID, youtu.be/VIDEO_ID
    const parts = url.pathname.split("/").filter(Boolean);
    const candidate = parts.at(-1) ?? "";
    if (/^[a-zA-Z0-9_-]{11}$/.test(candidate)) return candidate;
  } catch {
    // ignore parse errors and fall through
  }

  return input;
}

type Props = {
  videoId: string;
  title: string;
  className?: string;
  autoplay?: boolean;
  startSeconds?: number;
  disabled?: boolean;
  /** Kept for call-site compatibility; ignored in iframe-only mode. */
  onTime?: (seconds: number) => void;
  /** Kept for call-site compatibility; ignored in iframe-only mode. */
  onEnded?: () => void;
};

export function VideoPlayer({
  videoId,
  title,
  className,
  autoplay,
  startSeconds = 0,
  disabled
}: Props) {
  const safeVideoId = normalizeYoutubeVideoId(videoId);

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("YouTube videoId:", safeVideoId);
  }

  if (disabled) {
    return (
      <div className="aspect-video w-full rounded border bg-black/5">
        <div className="flex h-full items-center justify-center text-sm text-gray-600">Locked</div>
      </div>
    );
  }

  const shell =
    className?.trim() != null && className.trim() !== ""
      ? `video-container ${className}`
      : "video-container rounded border";
  const src = buildYoutubeEmbedSrc(safeVideoId, { autoplay, startSeconds });

  return (
    <div className={shell}>
      <iframe
        key={safeVideoId}
        title={title}
        src={src}
        className="h-full w-full"
        width="100%"
        height="100%"
        frameBorder="0"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
