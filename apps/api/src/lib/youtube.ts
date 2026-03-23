import { HttpError } from "../middleware/errorHandler";

export function extractYoutubeVideoId(youtubeUrl: string): string {
  try {
    const url = new URL(youtubeUrl);

    // https://www.youtube.com/watch?v=VIDEO_ID
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v;
    }

    // https://youtu.be/VIDEO_ID
    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace("/", "");
      if (id) return id;
    }

    // https://www.youtube.com/embed/VIDEO_ID
    if (url.pathname.startsWith("/embed/")) {
      const id = url.pathname.replace("/embed/", "");
      if (id) return id;
    }

    throw new Error("Unsupported YouTube URL format");
  } catch {
    throw new HttpError(400, "Invalid YouTube URL");
  }
}

export function toYoutubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}
