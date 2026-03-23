"use client";

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

export default function ProfilePage() {
  const router = useRouter();
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

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

  return (
    <div className="px-4 pt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Account</h1>
          <p className="mt-1 text-sm text-neutral-400">{user.name}</p>
          <p className="text-xs text-neutral-600">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => void logout().then(() => router.push("/login"))}
          className="rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
        >
          Log out
        </button>
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Progress</h2>
        <div className="mt-3 space-y-2">
          {(subjects ?? [])
            .filter((s) => s.is_enrolled)
            .map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-3"
              >
                <div className="font-medium text-white">{s.title}</div>
                <div className="text-sm text-emerald-400">{s.progress_percent}%</div>
              </div>
            ))}
          {(subjects ?? []).filter((s) => s.is_enrolled).length === 0 ? (
            <p className="text-sm text-neutral-600">No enrolled courses yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
