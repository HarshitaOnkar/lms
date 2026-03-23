"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { apiFetch } from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";

type SubjectListItem = {
  id: number;
  title: string;
  is_enrolled: boolean;
  progress_percent: number;
};

export default function LearningPage() {
  const router = useRouter();
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const user = useAuthStore((s) => s.user);
  const [subjects, setSubjects] = useState<SubjectListItem[] | null>(null);

  useEffect(() => {
    if (!bootstrapped) return;
    if (!user) {
      router.push("/login");
      return;
    }
    void (async () => {
      const res = await apiFetch("/api/subjects", { method: "GET" });
      if (!res.ok) return;
      setSubjects((await res.json()) as SubjectListItem[]);
    })();
  }, [bootstrapped, user, router]);

  if (!bootstrapped || !user) {
    return <div className="px-4 pt-8 text-sm text-neutral-500">Loading…</div>;
  }

  const enrolled = (subjects ?? []).filter((s) => s.is_enrolled);

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold text-white">My learning</h1>
      <p className="mt-2 text-sm text-neutral-500">Pick up where you left off.</p>

      <ul className="mt-8 space-y-3">
        {enrolled.length === 0 ? (
          <li className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-8 text-center text-sm text-neutral-500">
            No enrollments yet. Go to <span className="text-brand">Featured</span> and enroll in a course.
          </li>
        ) : (
          enrolled.map((s) => (
            <li key={s.id}>
              <Link
                href={`/subjects/${s.id}`}
                className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-4 transition hover:border-neutral-600"
              >
                <span className="font-medium text-white">{s.title}</span>
                <span className="text-sm text-emerald-400">{s.progress_percent}%</span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
