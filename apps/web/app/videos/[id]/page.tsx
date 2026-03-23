"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

import { apiFetch } from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";

export default function VideoRedirectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const user = useAuthStore((s) => s.user);

  const videoId = Number(params.id);

  useEffect(() => {
    if (!bootstrapped) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!Number.isFinite(videoId)) {
      router.push("/free-courses");
      return;
    }

    void (async () => {
      const res = await apiFetch(`/api/videos/${videoId}`, { method: "GET" });
      if (!res.ok) {
        router.push("/free-courses");
        return;
      }
      const data = (await res.json()) as { video: { subject_id: number } };
      router.replace(`/subjects/${data.video.subject_id}?video=${videoId}`);
    })();
  }, [bootstrapped, user, router, videoId]);

  return <div className="text-sm text-gray-600">Opening video…</div>;
}
