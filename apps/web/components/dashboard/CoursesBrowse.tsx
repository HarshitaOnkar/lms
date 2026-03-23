"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { FeaturedCourseCard } from "./FeaturedCourseCard";
import { apiFetch } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";

export type PricingFilter = "free" | "paid";

type SubjectListItem = {
  id: number;
  title: string;
  description: string | null;
  is_published: boolean;
  is_free?: boolean;
  is_enrolled: boolean;
  progress_percent: number;
};

function fakeRating(id: number) {
  return (4.2 + (id % 8) / 10).toFixed(1);
}

function fakeReviews(id: number) {
  return (1200 + id * 173).toLocaleString();
}

type Props = {
  pricing: PricingFilter;
};

export function CoursesBrowse({ pricing }: Props) {
  const router = useRouter();
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const user = useAuthStore((s) => s.user);

  const [subjects, setSubjects] = useState<SubjectListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ready = useMemo(() => bootstrapped, [bootstrapped]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.push("/login");
      return;
    }

    void (async () => {
      const res = await apiFetch(`/api/subjects?pricing=${pricing}`, { method: "GET" });
      if (!res.ok) {
        setError("Failed to load subjects");
        return;
      }
      setSubjects((await res.json()) as SubjectListItem[]);
    })();
  }, [ready, user, router, pricing]);

  async function enroll(subjectId: number) {
    const res = await apiFetch(`/api/enrollments/subjects/${subjectId}`, { method: "POST" });
    if (!res.ok) {
      setError("Failed to enroll");
      return;
    }

    setSubjects((prev) =>
      prev ? prev.map((s) => (s.id === subjectId ? { ...s, is_enrolled: true } : s)) : prev
    );
  }

  if (!ready || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-neutral-500">
        Loading…
      </div>
    );
  }
  if (error) {
    return <div className="px-4 pt-8 text-sm text-red-400">{error}</div>;
  }
  if (!subjects) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-neutral-500">
        Loading courses…
      </div>
    );
  }

  const published = subjects.filter((s) => s.is_published);
  if (published.length === 0) {
    const msg =
      pricing === "free"
        ? "No free courses yet"
        : "No paid courses yet";
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center text-neutral-500">
        <p className="text-lg text-white">{msg}</p>
        <p className="mt-2 text-sm">Check back soon or contact your administrator.</p>
      </div>
    );
  }
  const mid = Math.ceil(published.length / 2);
  const recommended = published.slice(0, mid);
  const popular = published.slice(mid);

  const sectionA =
    pricing === "free" ? "Recommended for you" : "Featured paid courses";
  const sectionB =
    pricing === "free" ? "Popular for full-stack learners" : "More paid programs";

  return (
    <div className="mx-auto min-h-screen max-w-lg">
      <header className="sticky top-0 z-40 flex items-center justify-end gap-4 border-b border-neutral-800/80 bg-[#0d0d0d]/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          aria-label="Cast"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125V4.875c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125m-17.25 0h17.25"
            />
          </svg>
        </button>
        <button
          type="button"
          className="relative rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          aria-label="Cart"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0016.136-1.046M12.75 12.75v-8.25m0 0L9 8.25m3.75-3.75L15 8.25"
            />
          </svg>
          <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand px-0.5 text-[10px] font-bold text-neutral-900">
            2
          </span>
        </button>
      </header>

      <section className="mt-2 px-4">
        <h2 className="text-lg font-bold text-white">{sectionA}</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {recommended.map((s, i) => (
            <FeaturedCourseCard
              key={s.id}
              id={s.id}
              title={s.title}
              description={s.description}
              isEnrolled={s.is_enrolled}
              progressPercent={s.progress_percent}
              rating={fakeRating(s.id)}
              reviews={fakeReviews(s.id)}
              tag={i === 0 ? (pricing === "free" ? "Bestseller" : "Premium") : undefined}
              isFree={s.is_free !== false}
              onEnroll={() => void enroll(s.id)}
            />
          ))}
        </div>
      </section>

      {popular.length > 0 ? (
        <section className="mt-10 px-4">
          <h2 className="text-lg font-bold text-white">{sectionB}</h2>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {popular.map((s) => (
              <FeaturedCourseCard
                key={`p-${s.id}`}
                id={s.id}
                title={s.title}
                description={s.description}
                isEnrolled={s.is_enrolled}
                progressPercent={s.progress_percent}
                rating={fakeRating(s.id + 3)}
                reviews={fakeReviews(s.id + 1)}
                isFree={s.is_free !== false}
                onEnroll={() => void enroll(s.id)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
